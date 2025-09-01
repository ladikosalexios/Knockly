class JobMatcher
  def initialize(job_description)
    @job_description = job_description
  end

  def top_candidates(limit: 5)
    return [] unless @job_description&.embedding.present?

    ApplicantProfile.where.not(embedding: nil).map do |profile|
      {
        applicant_profile: profile,
        score: cosine_similarity(profile.embedding, @job_description.embedding)
      }
    end.sort_by { |entry| -entry[:score] }.first(limit)
  end

  private

  def cosine_similarity(a, b)
    dot = a.zip(b).sum { |x, y| x * y }
    norm_a = Math.sqrt(a.sum { |x| x**2 })
    norm_b = Math.sqrt(b.sum { |y| y**2 })
    return 0.0 if norm_a.zero? || norm_b.zero?
    dot / (norm_a * norm_b)
  end
end

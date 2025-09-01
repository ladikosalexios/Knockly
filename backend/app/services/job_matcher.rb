class JobMatcher
  def initialize(job_description)
    @job_description = job_description
  end

  def top_candidates(limit: 5)
    return [] unless @job_description&.embedding.present?

    ApplicantProfile.where.not(embedding: nil).map do |profile|
      score = cosine_similarity(@job_description.embedding, profile.embedding)
      { profile: profile, score: score }
    end.sort_by { |h| -h[:score] }.first(limit)
  end

  private

  def cosine_similarity(a, b)
    dot = a.zip(b).sum { |x, y| x * y }
    norm_a = Math.sqrt(a.sum { |x| x * x })
    norm_b = Math.sqrt(b.sum { |y| y * y })
    return 0.0 if norm_a.zero? || norm_b.zero?
    dot / (norm_a * norm_b)
  end
end

class JobMatcher
  def initialize(job_description, company_id:)
    @job_description = job_description
    @company_id = company_id
  end

  def top_candidates(limit: 5)
    candidates = ApplicantProfile
      .joins(job_applications: :job)
      .where(jobs: { company_id: @company_id })
      .distinct

    candidates = candidates.where.not(embedding: nil) if @job_description&.embedding.present?

    scored = candidates.map do |profile|
      score = if @job_description&.embedding.present? && profile.embedding.present?
        cosine_similarity(@job_description.embedding, profile.embedding) * 100
      else
        MatchingService.score(
          applicant_profile: profile,
          job_description: @job_description,
          job_requirements: @job_description&.requirements
        )[:score]
      end

      { profile: profile, score: score }
    end

    scored.sort_by { |h| -(h[:score] || 0) }.first(limit)
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

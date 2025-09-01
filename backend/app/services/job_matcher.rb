class JobMatcher
  def initialize(job_description, company_id:, exclude_job_id: nil)
    @job_description = job_description
    @company_id = company_id
    @exclude_job_id = exclude_job_id
  end

  def top_candidates(limit: 5)
    return [] unless @job_description&.embedding.present?

    candidates = ApplicantProfile
      .joins(job_applications: :job)
      .where(jobs: { company_id: @company_id })
      .where.not(embedding: nil)
    candidates = candidates.where.not(job_applications: { job_id: @exclude_job_id }) if @exclude_job_id
    candidates = candidates.distinct

    candidates.map do |profile|
      score = cosine_similarity(@job_description.embedding, profile.embedding) * 100
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

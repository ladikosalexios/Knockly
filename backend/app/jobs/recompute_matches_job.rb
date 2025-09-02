class RecomputeMatchesJob < ApplicationJob
  queue_as :default

  THRESHOLD = 80

  def perform(job_description_id)
    jd = JobDescription.includes(job: :posted_by_user).find_by(id: job_description_id)
    return unless jd&.embedding.present?

    job = jd.job
    recruiter = job.posted_by_user

    cache_key = "job_matches:#{jd.id}"
    previous_scores = Rails.cache.read(cache_key) || {}
    if previous_scores.is_a?(Array)
      previous_scores = previous_scores.index_by { |m| m[:profile_id] }.transform_values { |m| m[:score] }
    end

    excluded_ids = previous_scores.select { |_, s| s.to_i >= THRESHOLD }.keys

    matcher = JobMatcher.new(jd, company_id: job.company_id, exclude_job_id: job.id)
    matches = matcher.top_candidates(limit: 20, exclude_profile_ids: excluded_ids)

    new_high_scores = matches.select do |m|
      score = m[:score].to_i
      prev = previous_scores[m[:profile].id]
      score >= THRESHOLD && (prev.nil? || prev.to_i < THRESHOLD)
    end

    matches.each do |m|
      previous_scores[m[:profile].id] = m[:score]
    end
    Rails.cache.write(cache_key, previous_scores)

    new_high_scores.each do |m|
      payload = {
        job_id: job.id,
        applicant_profile_id: m[:profile].id,
        score: m[:score]
      }
      ActionCable.server.broadcast("recruiter_notifications_#{recruiter.id}", payload)
      RecruiterMailer.new_high_score_match(recruiter, job, m[:profile], m[:score]).deliver_later
    end
  end
end

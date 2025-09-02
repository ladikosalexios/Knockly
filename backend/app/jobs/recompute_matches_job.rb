class RecomputeMatchesJob < ApplicationJob
  queue_as :default

  THRESHOLD = 80

  def perform(job_description_id)
    jd = JobDescription.includes(job: :posted_by_user).find_by(id: job_description_id)
    return unless jd&.embedding.present?

    job = jd.job
    recruiter = job.posted_by_user

    cache_key = "job_matches:#{jd.id}"
    previous_matches = Rails.cache.read(cache_key) || []
    previous_ids = previous_matches.map { |m| m[:profile_id] }

    matches = JobMatcher.new(jd, company_id: job.company_id, exclude_job_id: job.id)
                     .top_candidates(limit: 20)
    Rails.cache.write(cache_key, matches.map { |m| { profile_id: m[:profile].id, score: m[:score] } })

    new_high_scores = matches.select do |m|
      m[:score].to_i >= THRESHOLD && !previous_ids.include?(m[:profile].id)
    end

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

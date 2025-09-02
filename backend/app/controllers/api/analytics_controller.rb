class Api::AnalyticsController < ApplicationController
  before_action :require_admin!

  # GET /api/analytics
  def index
    data = Rails.cache.fetch("analytics_summary", expires_in: 10.minutes) do
      {
        users_count: User.count,
        companies_count: Company.count,
        jobs_count: Job.count,
        job_applications_count: JobApplication.count,
        avg_job_post_lifespan: average_job_lifespan,
        avg_application_processing_time: average_application_processing_time,
        job_status_distribution: Job.group(:status).count,
        application_status_distribution: JobApplication.group(:status).count
      }
    end

    render json: data
  end

  private

  def average_job_lifespan
    Job.where.not(expires_at: nil)
       .average("EXTRACT(EPOCH FROM (expires_at - created_at))")
       .to_f
  end

  def average_application_processing_time
    JobApplication.average("EXTRACT(EPOCH FROM (updated_at - created_at))")
                  .to_f
  end
end


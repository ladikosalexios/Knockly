class Api::Candidates::InterviewsController < ApplicationController
  skip_before_action :authenticate_user!
  before_action :require_candidate!

  def index
    interviews = Interview.joins(:job_application)
                          .where(job_applications: { applicant_profile_id: current_candidate.id })
                          .where('scheduled_at >= ?', Time.current)
                          .order(:scheduled_at)
    data = interviews.map do |iv|
      {
        id: iv.id,
        scheduled_at: iv.scheduled_at,
        location: iv.location,
        notes: iv.notes,
        job_application_id: iv.job_application_id
      }
    end
    render json: data
  end
end

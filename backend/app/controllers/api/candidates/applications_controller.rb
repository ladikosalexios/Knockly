class Api::Candidates::ApplicationsController < ApplicationController
  skip_before_action :authenticate_user!
  before_action :require_candidate!

  def index
    applications = current_candidate.job_applications.includes(job: :job_description)
    data = applications.map do |app|
      {
        id: app.id,
        status: app.status,
        applied_at: app.created_at,
        job: {
          id: app.job.id,
          title: app.job.job_description&.title
        }
      }
    end
    render json: data
  end
end

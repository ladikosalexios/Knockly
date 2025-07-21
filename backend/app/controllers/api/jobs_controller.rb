class Api::JobsController < ApplicationController
  before_action :authenticate_user!, only: [:show, :create]
  # GET /api/jobs
  # Lists all active jobs. Can filter by company_id and search by query string.
  def index
    # Get all active jobs, including their company and job description associations.
    jobs = Job.includes(:company, :job_description).where(status: "active")
    # Optional: Full-text search on job title or location (from job_description).
    if params[:q].present?
      q = "%#{params[:q].downcase}%"
      jobs = jobs.joins(:job_description).where(
        "LOWER(job_descriptions.title) LIKE ? OR LOWER(job_descriptions.location) LIKE ?",
        q, q
      ).distinct
    end
    # Render jobs as JSON, including nested company and job description (with skills).
    render json: jobs.as_json(include: {
      company: {},
      job_description: { include: :skills }
    })
  end

  # GET /api/jobs/:id
  # Shows a single job with its company and job description (with skills).
  def show
    job = Job.includes(:company, :job_description).find(params[:id])
    render json: job.as_json(include: {
      company: {},
      job_description: { include: :skills }
    })
  end


  # POST /api/jobs
  # Creates a new job. Expects params to include job and its associations.
  def create
    job = Job.new(job_params)
    if job.save
      render json: job, status: :created
    else
      render json: { errors: job.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  # Strong parameters for job creation.
  def job_params
    params.require(:job).permit(
      :company_id, :posted_by_user_id, :job_description_id, :title, :description, :location,
      :is_remote, :job_type, :experience_level, :salary_min, :salary_max,
      :salary_currency, :is_salary_visible, :status, :expires_at
    )
  end
end
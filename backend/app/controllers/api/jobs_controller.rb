class Api::JobsController < ApplicationController
  def index
    jobs = Job.includes(:company, :skills, :job_description).where(status: "active")
    if params[:q].present?
      q = "%#{params[:q].downcase}%"
      jobs = jobs.joins(:job_description, :skills).where(
        "LOWER(job_descriptions.title) LIKE ? OR LOWER(job_descriptions.location) LIKE ? OR LOWER(skills.name) LIKE ?",
        q, q, q
      ).distinct
    end
    render json: jobs.as_json(include: {
      company: {},
      skills: {},
      job_description: { include: :skills }
    })
  end

  def show
    job = Job.includes(:company, :skills, :job_description).find(params[:id])
    render json: job.as_json(include: {
      company: {},
      skills: {},
      job_description: { include: :skills }
    })
  end

  def create
    job = Job.new(job_params)
    if job.save
      render json: job, status: :created
    else
      render json: { errors: job.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def job_params
  params.require(:job).permit(
    :company_id, :posted_by_user_id, :job_description_id, :title, :description, :location,
    :is_remote, :job_type, :experience_level, :salary_min, :salary_max,
    :salary_currency, :is_salary_visible, :status, :expires_at
  )
  end
end

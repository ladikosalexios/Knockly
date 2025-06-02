class Api::JobsController < ApplicationController
  def index
    jobs = Job.includes(:company, :skills).where(status: "active")
    if params[:q].present?
      q = "%#{params[:q].downcase}%"
      jobs = jobs.joins(:skills).where(
        "LOWER(jobs.title) LIKE ? OR LOWER(jobs.location) LIKE ? OR LOWER(skills.name) LIKE ?",
        q, q, q
      ).distinct
    end
    render json: jobs.as_json(include: { company: {}, skills: {} })
  end

  def show
    job = Job.find(params[:id])
    render json: job.as_json(include: { company: {}, skills: {} })
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
      :company_id, :posted_by_user_id, :title, :description, :location,
      :is_remote, :job_type, :experience_level, :salary_min, :salary_max,
      :salary_currency, :is_salary_visible, :status, :expires_at
    )
  end
end

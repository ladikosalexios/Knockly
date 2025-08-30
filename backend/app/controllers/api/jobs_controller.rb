class Api::JobsController < ApplicationController
  before_action :authenticate_user!, only: [:create]
  # GET /api/jobs
  # Lists all active jobs. Can filter by company_id and search by query string.
  # 
  #
  # def index
  #   jobs = Job.includes(:company, :job_description).all

  #   render json: jobs.as_json(include: {
  #     company: {},
  #     job_description: { include: :skills }
  #   })
  # end
  def index
    # Get all active jobs, joining job_descriptions to allow filtering on its fields
    jobs = Job.includes(:company, :job_description)
              .joins(:job_description)
              .where(status: "active")

    if params[:company_id].present?
      jobs = jobs.where(company_id: params[:company_id])
    end

    # Optional: Full-text search on job title or location (from job_description).
    if params[:q].present?
      q = "%#{params[:q].downcase}%"
      jobs = jobs.where(
        "LOWER(job_descriptions.title) LIKE ? OR LOWER(job_descriptions.location) LIKE ?",
        q, q
      )
    end

    if params[:job_type].present?
      jobs = jobs.where(job_descriptions: { job_type: params[:job_type] })
    end

    if params[:is_remote].present?
      remote = ActiveModel::Type::Boolean.new.cast(params[:is_remote])
      jobs = jobs.where(job_descriptions: { is_remote: remote })
    end

    if params[:salary_min].present?
      jobs = jobs.where("job_descriptions.salary_min >= ?", params[:salary_min].to_i)
    end

    if params[:salary_max].present?
      jobs = jobs.where("job_descriptions.salary_max <= ?", params[:salary_max].to_i)
    end

    # Pagination
    page = params.fetch(:page, 1).to_i
    per_page = params.fetch(:per_page, 20).to_i
    page = 1 if page < 1
    per_page = 20 if per_page <= 0

    total_count = jobs.count
    jobs = jobs.offset((page - 1) * per_page).limit(per_page)

    render json: {
      jobs: jobs.as_json(include: {
        company: {},
        job_description: { include: :skills }
      }),
      page: page,
      per_page: per_page,
      total_pages: (total_count.to_f / per_page).ceil,
      total_count: total_count
    }
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

class Api::JobsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:track_variant]
  before_action :authenticate_user!, only: [:create, :update, :variants, :create_variant, :activate_variant]
  before_action :require_admin!, only: [:variants, :create_variant, :activate_variant]
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
    # DEPRECATED: use /api/companies/:slug/jobs instead for public-facing job boards
    # Get all active jobs, including their company and job description associations.
    jobs = Job.includes(:company, job_description: :skills).where(status: "active")

    if params[:company_id].present?
      jobs = jobs.where(company_id: params[:company_id])
    end

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
    job = Job.includes(:company, job_description: :skills).find(params[:id])
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

  # PUT /api/jobs/:id
  # Updates an existing job.
  def update
    job = Job.find(params[:id])
    if job.update(job_params)
      render json: job
    else
      render json: { errors: job.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def variants
    job = Job.find(params[:id])
    render json: job.job_post_variants
  end

  def create_variant
    job = Job.find(params[:id])
    variant = job.job_post_variants.create!(variant_params)
    render json: variant, status: :created
  end

  def activate_variant
    job = Job.find(params[:id])
    variant = job.job_post_variants.find(params[:variant_id])
    job.job_post_variants.update_all(active: false)
    variant.update!(active: true)
    render json: variant
  end

  def track_variant
    job = Job.find(params[:id])
    variant = job.job_post_variants.find(params[:variant_id])
    case params[:event]
    when "view"
      variant.increment!(:view_count)
    when "click"
      variant.increment!(:click_count)
    when "apply"
      variant.increment!(:apply_count)
    else
      render json: { error: "invalid event" }, status: :unprocessable_entity and return
    end
    head :ok
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

  def variant_params
    params.require(:variant).permit(
      :title,
      :description,
      :location,
      :is_remote,
      :requirements,
      :skills,
      :job_type,
      :years_experience_min,
      :years_experience_max,
      :salary_min,
      :salary_max,
      :salary_currency,
      :expires_at
    )
  end
end

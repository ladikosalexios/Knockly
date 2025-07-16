class Api::JobDescriptionsController < ApplicationController
  def create
    jd = JobDescription.new(job_description_params)
    if jd.save
      render json: jd, status: :created
    else
      render json: { errors: jd.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def job_description_params
    params.permit(
      :title, :description, :requirements, :benefits, :company_name, :location,
      :is_remote, :job_type, :experience_level, :salary_min, :salary_max,
      :salary_currency, :is_salary_visible, :external_id, :source, :parsed_at
    )
  end
end

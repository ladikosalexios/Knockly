class Api::JobDescriptionsController < ApplicationController
  def create
    ActiveRecord::Base.transaction do
      jd = JobDescription.create!(job_description_params)
      # Attach skills if any provided
      (params[:skills] || []).each do |name|
        skill = Skill.find_or_create_by!(name: name)
        JobDescriptionSkill.create!(job_description: jd, skill: skill)
      end
      render json: jd.as_json(include: { skills: {} }), status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [ e.message ] }, status: :unprocessable_entity
  end

  private

  def job_description_params
    params.permit(
      :title, :description, :requirements, :company_name, :location,
      :is_remote, :job_type, :years_experience_min, :years_experience_max,
      :salary_min, :salary_max, :salary_currency, :is_salary_visible,
      :external_id, :source, :parsed_at
    )
  end
end

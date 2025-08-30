class Api::JobDescriptionsController < ApplicationController
  before_action :authenticate_user!

  def create
    ActiveRecord::Base.transaction do
      jd_params = job_description_params.to_h

      # Convert requirements array to string if needed
      if params[:requirements].is_a?(Array)
        jd_params["requirements"] = params[:requirements].join("\n")
      end

      jd = JobDescription.create!(jd_params)
      begin
        jd.update!(embedding: EmbeddingService.generate("#{jd.title}\n#{jd.description}\n#{jd.requirements}"))
      rescue => e
        Rails.logger.warn "[JobDescription] Failed to generate embedding: #{e.message}"
      end
      (params[:skills] || []).each do |name|
        canonical = name.to_s.downcase.strip
        skill = Skill.find_or_create_by!(name: canonical)
        JobDescriptionSkill.find_or_create_by!(job_description: jd, skill: skill)
      end
    render json: jd.as_json(include: { skills: {} }), status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [ e.message ] }, status: :unprocessable_entity
  end

  def update
    ActiveRecord::Base.transaction do
      jd = JobDescription.find(params[:id])
      jd_params = job_description_params.to_h

      if params[:requirements].is_a?(Array)
        jd_params["requirements"] = params[:requirements].join("\n")
      end

      jd.update!(jd_params)
      begin
        jd.update!(embedding: EmbeddingService.generate("#{jd.title}\n#{jd.description}\n#{jd.requirements}"))
      rescue => e
        Rails.logger.warn "[JobDescription] Failed to generate embedding: #{e.message}"
      end

      if params.key?(:skills)
        jd.skills.clear
        (params[:skills] || []).each do |name|
          canonical = name.to_s.downcase.strip
          skill = Skill.find_or_create_by!(name: canonical)
          JobDescriptionSkill.find_or_create_by!(job_description: jd, skill: skill)
        end
      end

      render json: jd.as_json(include: { skills: {} })
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [ e.message ] }, status: :unprocessable_entity
  end

  private

  def job_description_params
    params.permit(
      :job_id,  # <--- add this
      :title,
      :description,
      :company_name,
      :location,
      :is_remote,
      :job_type,
      :years_experience_min,
      :years_experience_max,
      :salary_min,
      :salary_max,
      :salary_currency,
      :is_salary_visible,
      :external_id,
      :source,
      :parsed_at,
      :requirements
    )
  end

  # def job_description_params
  #   params.permit(
  #     :title, :description, :requirements, :company_name, :location,
  #     :is_remote, :job_type, :years_experience_min, :years_experience_max,
  #     :salary_min, :salary_max, :salary_currency, :is_salary_visible,
  #     :external_id, :source, :parsed_at
  #   )
  # end
end

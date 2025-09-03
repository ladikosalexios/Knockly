class Api::JobDescriptionTemplatesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_template, only: [:show, :update, :destroy]

  def index
    templates = JobDescriptionTemplate.includes(:skills).order(created_at: :desc)
    render json: templates.as_json(include: { skills: {} })
  end

  def show
    render json: @template.as_json(include: { skills: {} })
  end

  def create
    ActiveRecord::Base.transaction do
      tpl_params = template_params.to_h
      if params[:requirements].is_a?(Array)
        tpl_params["requirements"] = params[:requirements].join("\n")
      end
      template = JobDescriptionTemplate.create!(tpl_params)
      assign_skills(template)
      render json: template.as_json(include: { skills: {} }), status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def update
    ActiveRecord::Base.transaction do
      tpl_params = template_params.to_h
      if params[:requirements].is_a?(Array)
        tpl_params["requirements"] = params[:requirements].join("\n")
      end
      @template.update!(tpl_params)
      assign_skills(@template) if params.key?(:skills)
      render json: @template.as_json(include: { skills: {} })
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  def destroy
    @template.destroy!
    head :no_content
  end

  private

  def set_template
    @template = JobDescriptionTemplate.find(params[:id])
  end

  def template_params
    params.permit(
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
      :requirements,
      :embedding
    )
  end

  def assign_skills(template)
    names = (params[:skills] || []).map { |n| n.to_s.downcase.strip }.uniq
    return if names.empty?

    skills_map = Skill.where(name: names).index_by(&:name)
    missing = names - skills_map.keys
    missing.each { |n| skills_map[n] = Skill.create!(name: n) }
    template.skills = skills_map.values
  end
end

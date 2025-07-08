class Api::CandidateResumesController < ApplicationController
  # protect_from_forgery with: :null_session

  def create
    ActiveRecord::Base.transaction do
      resume = CandidateResume.create!(
        job_title: params[:job_title],
        description: params[:description],
        years_experience_min: params[:years_experience_min],
        years_experience_max: params[:years_experience_max]
      )

      (params[:skills] || []).each do |name|
        skill = Skill.find_or_create_by!(name: name)
        ResumeSkill.create!(candidate_resume: resume, skill: skill)
      end

      render json: resume.as_json(include: { skills: {} }), status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def show
    resume = CandidateResume.includes(:skills).find(params[:id])
    render json: resume.as_json(include: { skills: {} })
  end

  def index
    resumes = CandidateResume.includes(:skills).all
    render json: resumes.as_json(include: { skills: {} })
  end
end

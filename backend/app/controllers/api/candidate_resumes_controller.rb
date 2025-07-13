class Api::CandidateResumesController < ApplicationController
  # protect_from_forgery with: :null_session

  def create
    resume = CandidateResume.find_or_initialize_by(email: params[:email])
    resume.assign_attributes(
      name: params[:name],
      resume_text: params[:resume_text]
    )
    if resume.save
      render json: { status: "ok", resume: resume }, status: :created
    else
      render json: { errors: resume.errors.full_messages }, status: :unprocessable_entity
    end
  end


  def show
    resume = CandidateResume.find_by(email: params[:email])
    if resume
      render json: resume
    else
      render json: { error: "Not found" }, status: :not_found
    end
  end

  def index
    resumes = CandidateResume.includes(:skills).all
    render json: resumes.as_json(include: { skills: {} })
  end
end

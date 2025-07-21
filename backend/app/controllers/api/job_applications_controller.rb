class Api::JobApplicationsController < ApplicationController
  skip_before_action :authenticate_user!
  def create
    Rails.logger.info "PARAMS: #{params.inspect}"
    job = Job.find(job_application_params[:job_id])

    # If you want to keep profile logic, keep this block; otherwise, remove
    applicant_profile = nil
    if job_application_params[:experiences] || job_application_params[:educations] ||
         job_application_params[:skills] || job_application_params[:total_years_experience]
      profile = ApplicantProfile.find_or_initialize_by(email: job_application_params[:email])
      profile.name = job_application_params[:name]
      profile.total_years_experience = job_application_params[:total_years_experience]
      profile.save!

      if job_application_params[:experiences]
        profile.applicant_experiences.destroy_all
        job_application_params[:experiences].each do |exp|
          profile.applicant_experiences.create!(exp.permit(:job_title, :company_name, :start_date, :end_date, :description))
        end
      end

      if job_application_params[:educations]
        profile.applicant_educations.destroy_all
        job_application_params[:educations].each do |edu|
          profile.applicant_educations.create!(edu.permit(:degree, :school, :field_of_study, :start_year, :end_year, :description))
        end
      end

      if job_application_params[:skills]
        profile.skills = job_application_params[:skills].map { |name| Skill.find_or_create_by!(name: name) }
      end

      applicant_profile = profile
    end

    application = job.job_applications.create!(
      name: job_application_params[:name],
      email: job_application_params[:email],
      phone: job_application_params[:phone],
      work_authorization: job_application_params[:work_authorization],
      gender: job_application_params[:gender],
      ethnicity: job_application_params[:ethnicity],
      disability_status: job_application_params[:disability_status],
      veteran_status: job_application_params[:veteran_status],
      resume_text: job_application_params[:resume_text],
      applicant_profile: applicant_profile
    )

    render json: { status: "ok", application: application }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.info "Errors: #{e.message}"
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  def index
    apps = JobApplication.all
    render json: apps
  end

  private

  def job_application_params
    # Accept both top-level and nested under :job_application
    params.require(:job_application).permit(
      :job_id,
      :name,
      :email,
      :phone,
      :work_authorization,
      :gender,
      :ethnicity,
      :disability_status,
      :veteran_status,
      :resume_text,
      :total_years_experience,
      experiences: [:job_title, :company_name, :start_date, :end_date, :description],
      educations: [:degree, :school, :field_of_study, :start_year, :end_year, :description],
      skills: []
    )
  rescue ActionController::ParameterMissing
    # fallback: accept top-level fields for backward compatibility
    params.permit(
      :job_id,
      :name,
      :email,
      :phone,
      :work_authorization,
      :gender,
      :ethnicity,
      :disability_status,
      :veteran_status,
      :resume_text,
      :total_years_experience,
      experiences: [:job_title, :company_name, :start_date, :end_date, :description],
      educations: [:degree, :school, :field_of_study, :start_year, :end_year, :description],
      skills: []
    )
  end
end
class Api::JobApplicationsController < ApplicationController
  # POST /api/job_applications
  # Allows a public user to apply for a job, optionally storing a structured applicant profile.
  def create
    job = Job.find(params[:job_id])

    # Upsert ApplicantProfile if structured info is provided
    applicant_profile = if application_params[:experiences] || application_params[:educations] ||
                           application_params[:skills] || application_params[:total_years_experience]
      # Find or initialize ApplicantProfile by email
      profile = ApplicantProfile.find_or_initialize_by(email: application_params[:email])
      profile.name = application_params[:name]
      profile.total_years_experience = application_params[:total_years_experience]
      profile.save!

      # Save experiences (replace any previous)
      if application_params[:experiences]
        profile.applicant_experiences.destroy_all
        application_params[:experiences].each do |exp|
          profile.applicant_experiences.create!(exp.permit(:job_title, :company_name, :start_date, :end_date, :description))
        end
      end

      # Save educations (replace any previous)
      if application_params[:educations]
        profile.applicant_educations.destroy_all
        application_params[:educations].each do |edu|
          profile.applicant_educations.create!(edu.permit(:degree, :school, :field_of_study, :start_year, :end_year, :description))
        end
      end

      # Save skills (replace any previous)
      if application_params[:skills]
        profile.skills = application_params[:skills].map { |name| Skill.find_or_create_by!(name: name) }
      end

      profile
    end

    # Create the job application and associate applicant_profile if exists
    application = job.job_applications.create!(
      name: application_params[:name],
      email: application_params[:email],
      resume_text: application_params[:resume_text],
      applicant_profile: applicant_profile
    )

    render json: { status: "ok", application: application }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  # GET /api/job_applications
  # List all job applications (for admin review).
  def index
    apps = JobApplication.all
    render json: apps
  end

  private

  # Strong parameters for job application, permitting nested attributes.
  def application_params
    params.permit(
      :job_id,
      :name,
      :email,
      :resume_text,
      :total_years_experience,
      experiences: [:job_title, :company_name, :start_date, :end_date, :description],
      educations: [:degree, :school, :field_of_study, :start_year, :end_year, :description],
      skills: []
    )
  end
end

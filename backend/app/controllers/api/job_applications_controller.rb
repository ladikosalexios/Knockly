require 'openai'
class Api::JobApplicationsController < ApplicationController
  wrap_parameters format: [:json]
  skip_before_action :authenticate_user!
  def create
    Rails.logger.info "Starting job application creation..."
    Rails.logger.info "PARAMS: #{params.inspect}"
    if job_application_params[:resume_text].present?
      gpt_output = parse_resume_with_gpt(job_application_params[:resume_text])
      Rails.logger.info("GPT Output: #{gpt_output.inspect}")

      begin
      parsed_data = gpt_output.is_a?(String) ? JSON.parse(gpt_output) : gpt_output
      rescue JSON::ParserError => e
        Rails.logger.error("JSON parsing failed: #{e.message}")
        parsed_data = {}
      end

      Rails.logger.info("GPT Parsed Data: #{parsed_data.inspect}")

      experiences = parsed_data["experiences"] || []
      educations  = parsed_data["educations"] || []
      skills      = parsed_data["skills"] || []

      Rails.logger.info("GPT Experiences: #{experiences.inspect}")
      Rails.logger.info("GPT Educations: #{educations.inspect}")
      Rails.logger.info("GPT Skills: #{skills.inspect}")

      # Create ApplicantProfile
      Rails.logger.info "Processing applicant profile creation..."
      profile = ApplicantProfile.create!(
        name: parsed_data["name"] || params[:name],
        email: parsed_data["email"] || params[:email],
        total_years_experience: parsed_data["total_years_experience"] || params[:total_years_experience],
        resume_text: job_application_params[:resume_text]
      )
      Rails.logger.info "ApplicantProfile created: #{profile.inspect}"

      # Add experiences if present
      (parsed_data["experiences"] || []).each do |exp|
        profile.applicant_experiences.create!(
          job_title: exp["job_title"],
          company_name: exp["company_name"],
          start_date: parse_date_string(exp["start_date"]),
          end_date: parse_date_string(exp["end_date"]),
          description: exp["description"]
        )
      end
      Rails.logger.info "Creating #{(parsed_data["experiences"] || []).count} experiences for ApplicantProfile #{profile.id}"

      # Add educations if present
      (parsed_data["educations"] || []).each do |edu|
        profile.applicant_educations.create!(
          degree: edu["degree"],
          school: edu["school"],
          field_of_study: edu["field_of_study"],
          start_year: edu["start_year"],
          end_year: edu["end_year"],
          description: edu["description"]
        )
      end
      Rails.logger.info "Creating #{(parsed_data["educations"] || []).count} educations for ApplicantProfile #{profile.id}"

      # Add skills if present
      (parsed_data["skills"] || []).each do |skill_name|
        skill = Skill.find_or_create_by!(name: skill_name.downcase.strip)
        profile.applicant_profile_skills.create!(skill: skill)
      end
      Rails.logger.info "Assigning #{(parsed_data["skills"] || []).count} skills to ApplicantProfile #{profile.id}"

      # Now create the JobApplication and associate the profile
      Rails.logger.info "Building JobApplication with: #{job_application_params.inspect}"
      @job_application = JobApplication.new(job_application_params)
      Rails.logger.info "JobApplication built: #{@job_application.inspect}"
      @job_application.applicant_profile = profile
      if @job_application.save
        Rails.logger.info "JobApplication saved successfully: #{@job_application.id}"
      else
        Rails.logger.error "JobApplication failed to save: #{@job_application.errors.full_messages}"
      end

      render json: { status: "ok", application: @job_application }, status: :created
    else
      job = Job.find(job_application_params[:job_id])

      applicant_profile = nil
      if job_application_params[:experiences] || job_application_params[:educations] ||
           job_application_params[:skills] || job_application_params[:total_years_experience]
        Rails.logger.info "Processing applicant profile creation..."
        profile = ApplicantProfile.find_or_initialize_by(email: job_application_params[:email])
        profile.name = job_application_params[:name]
        profile.total_years_experience = job_application_params[:total_years_experience]
        profile.save!
        Rails.logger.info "ApplicantProfile created: #{profile.inspect}"

        if job_application_params[:experiences]
          profile.applicant_experiences.destroy_all
          job_application_params[:experiences].each do |exp|
            profile.applicant_experiences.create!(exp.permit(:job_title, :company_name, :start_date, :end_date, :description))
          end
          Rails.logger.info "Creating #{job_application_params[:experiences].count} experiences for ApplicantProfile #{profile.id}"
        end

        if job_application_params[:educations]
          profile.applicant_educations.destroy_all
          job_application_params[:educations].each do |edu|
            profile.applicant_educations.create!(edu.permit(:degree, :school, :field_of_study, :start_year, :end_year, :description))
          end
          Rails.logger.info "Creating #{job_application_params[:educations].count} educations for ApplicantProfile #{profile.id}"
        end

        if job_application_params[:skills]
          profile.skills = job_application_params[:skills].map { |name| Skill.find_or_create_by!(name: name) }
          Rails.logger.info "Assigning #{job_application_params[:skills].count} skills to ApplicantProfile #{profile.id}"
        end

        applicant_profile = profile
      end

      Rails.logger.info "Building JobApplication with: #{job_application_params.inspect}"
      application = job.job_applications.new
      application.assign_attributes(job_application_params)
      Rails.logger.info "JobApplication built: #{application.inspect}"
      puts "JOB APPLICATION PARAMS DEBUG:"
      pp job_application_params
      application.applicant_profile = applicant_profile
      puts "APPLICATION OBJECT STATE:"
      pp application
      puts "PROFILE STATE:"
      pp application.applicant_profile
      application.save!

      render json: { status: "ok", application: application }, status: :created
    end
    Rails.logger.info "Job application processing complete."
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.info "Errors: #{e.message}"
    render json: { errors: e.message }, status: :unprocessable_entity
  end

  # api/job_applications
  def index
    if params[:job_id].present?
      job = Job.find(params[:job_id])
      apps = JobApplication.where(job_id: params[:job_id]).includes(applicant_profile: [:applicant_experiences, :applicant_educations, :skills])
    else
      apps = JobApplication.includes(:job).includes(applicant_profile: [:applicant_experiences, :applicant_educations, :skills])
    end

    results = apps.map do |app|
      profile = app.applicant_profile
      job_description = app.job.job_description.description
      job_requirements = app.job.job_description.requirements

      score_data = MatchingService.score(
        applicant_profile: profile,
        job_description: job_description,
        job_requirements: job_requirements
      )


      app.as_json(include: {
        applicant_profile: {
          include: {
            applicant_experiences: {},
            applicant_educations: {},
            skills: { only: [:name] }
          }
        }
      }).merge(
        match_score: score_data[:score],
        match_reason: score_data[:reason]
      )
    end

    render json: results
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
  # Parse resume using GPT and return structured data as a hash.
  def parse_resume_with_gpt(resume_text)
    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])

    prompt = <<~PROMPT
      You are a resume parser. Extract structured data from the text below and return it in JSON format.

      Fields:
      - name
      - email
      - phone
      - total_years_experience
      - skills: array of skill names
      - experiences: array of objects with job_title, company_name, start_date, end_date, description
      - educations: array of objects with degree, school, field_of_study, start_year, end_year, description

      Resume Text:
      #{resume_text}
    PROMPT

    response = client.chat(
      parameters: {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      }
    )

    content = response.dig("choices", 0, "message", "content")
    JSON.parse(content) rescue {}
  rescue => e
    Rails.logger.warn "GPT resume parse failed: #{e.message}"
    {}
  end

  def parse_date_string(raw_date)
    return nil unless raw_date.present?
    Date.parse(raw_date) rescue nil
  end
end
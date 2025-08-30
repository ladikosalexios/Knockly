require 'openai'
require 'pdf/reader'
require 'docx'
class Api::JobApplicationsController < ApplicationController
  wrap_parameters format: [:json]
  skip_before_action :authenticate_user!
  def create
    Rails.logger.info "Starting job application creation..."
    Rails.logger.info "PARAMS: #{params.inspect}"
    resume_text = job_application_params[:resume_text].presence
    if resume_text.blank? && job_application_params[:resume_file].present?
      resume_text = extract_resume_text(job_application_params[:resume_file])
    end
    if resume_text.present?
      gpt_output = parse_resume_with_gpt(resume_text)
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

      # Create or update ApplicantProfile using the email supplied in the form
      Rails.logger.info "Processing applicant profile creation..."
      email = job_application_params[:email]&.strip&.downcase
      profile_attrs = {
        name: parsed_data["name"] || job_application_params[:name],
        total_years_experience: job_application_params[:total_years_experience],
        resume_text: resume_text
      }
      profile = ApplicantProfile.find_or_initialize_by(email: email)
      profile.assign_attributes(profile_attrs)
      begin
        profile.save!
      rescue ActiveRecord::RecordNotUnique
        profile = ApplicantProfile.find_by!(email: email)
        profile.update!(profile_attrs)
      end
      Rails.logger.info "ApplicantProfile created: #{profile.inspect}"

      # Add experiences if present
      if experiences.present?
        profile.applicant_experiences.destroy_all
        experiences.each do |exp|
          profile.applicant_experiences.create!(
            job_title: exp["job_title"],
            company_name: exp["company_name"],
            start_date: parse_date_string(exp["start_date"]),
            end_date: parse_date_string(exp["end_date"]),
            description: exp["description"]
          )
        end
        Rails.logger.info "Creating #{experiences.count} experiences for ApplicantProfile #{profile.id}"
      end

      # Add educations if present
      if educations.present?
        profile.applicant_educations.destroy_all
        educations.each do |edu|
          profile.applicant_educations.create!(
            degree: edu["degree"],
            school: edu["school"],
            field_of_study: edu["field_of_study"],
            start_year: edu["start_year"],
            end_year: edu["end_year"],
            description: edu["description"]
          )
        end
        Rails.logger.info "Creating #{educations.count} educations for ApplicantProfile #{profile.id}"
      end

      # Add skills if present
      if skills.present?
        profile.applicant_profile_skills.destroy_all
        skills.each do |skill_name|
          skill = Skill.find_or_create_by!(name: skill_name.downcase.strip)
          profile.applicant_profile_skills.create!(skill: skill)
        end
        Rails.logger.info "Assigning #{skills.count} skills to ApplicantProfile #{profile.id}"
      end

      # Now create the JobApplication and associate the profile
      Rails.logger.info "Building JobApplication with: #{job_application_params.inspect}"
      application_attrs = job_application_params.except(:resume_file, :resume_text, :total_years_experience, :experiences, :educations, :skills)
      @job_application = JobApplication.new(application_attrs.merge(email: email, resume_text: resume_text))
      @job_application.resume_file.attach(job_application_params[:resume_file]) if job_application_params[:resume_file]
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
      if job_application_params[:experiences].present? || job_application_params[:educations].present? ||
           job_application_params[:skills].present? || job_application_params[:total_years_experience]
        Rails.logger.info "Processing applicant profile creation..."
        email = job_application_params[:email]&.strip&.downcase
        profile_attrs = {
          name: job_application_params[:name],
          total_years_experience: job_application_params[:total_years_experience]
        }
        profile = ApplicantProfile.find_or_initialize_by(email: email)
        profile.assign_attributes(profile_attrs)
        begin
          profile.save!
        rescue ActiveRecord::RecordNotUnique
          profile = ApplicantProfile.find_by!(email: email)
          profile.update!(profile_attrs)
        end
        Rails.logger.info "ApplicantProfile created: #{profile.inspect}"

        if job_application_params[:experiences].present?
          profile.applicant_experiences.destroy_all
          job_application_params[:experiences].each do |exp|
            profile.applicant_experiences.create!(
              exp.permit(:job_title, :company_name, :start_date, :end_date, :description)
            )
          end
          Rails.logger.info "Creating #{job_application_params[:experiences].count} experiences for ApplicantProfile #{profile.id}"
        end

        if job_application_params[:educations].present?
          profile.applicant_educations.destroy_all
          job_application_params[:educations].each do |edu|
            profile.applicant_educations.create!(
              edu.permit(:degree, :school, :field_of_study, :start_year, :end_year, :description)
            )
          end
          Rails.logger.info "Creating #{job_application_params[:educations].count} educations for ApplicantProfile #{profile.id}"
        end

        if job_application_params[:skills].present?
          profile.skills = job_application_params[:skills].map { |name| Skill.find_or_create_by!(name: name) }
          Rails.logger.info "Assigning #{job_application_params[:skills].count} skills to ApplicantProfile #{profile.id}"
        end

        applicant_profile = profile
      end

      Rails.logger.info "Building JobApplication with: #{job_application_params.inspect}"
      application = job.job_applications.new
      email = job_application_params[:email]&.strip&.downcase
      application.assign_attributes(job_application_params.merge(email: email))
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

  def extract_resume
    if params[:resume_file].present?
      text = extract_resume_text(params[:resume_file])
      render json: { resume_text: text }
    else
      render json: { error: 'resume_file missing' }, status: :unprocessable_entity
    end
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
      job_description = app.job.job_description

      score_data = MatchingService.score(
        applicant_profile: profile,
        job_description: job_description,
        job_requirements: job_description.requirements
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
      :resume_file,
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
      :resume_file,
      :total_years_experience,
      experiences: [:job_title, :company_name, :start_date, :end_date, :description],
      educations: [:degree, :school, :field_of_study, :start_year, :end_year, :description],
      skills: []
    )
  end

  def extract_resume_text(file)
    case File.extname(file.original_filename).downcase
    when '.pdf'
      PDF::Reader.new(file.tempfile.path).pages.map(&:text).join("\n")
    when '.doc', '.docx'
      Docx::Document.open(file.tempfile.path).paragraphs.map(&:text).join("\n")
    else
      file.read
    end
  rescue => e
    Rails.logger.warn "Resume text extraction failed: #{e.message}"
    ""
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
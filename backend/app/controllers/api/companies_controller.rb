class Api::CompaniesController < ApplicationController
  # ✅ Require the user to be logged in
before_action :authenticate_user!
skip_before_action :authenticate_user!, only: [:show_by_slug, :jobs_by_slug]

  def create
    name = params[:name]
    industry = params[:industry]

    if name.blank?
      render json: { error: "Missing required fields." }, status: :bad_request
      return
    end

    company = Company.new(name: name, industry: industry)

    if company.save
      current_user.update(company_id: company.id)
      render json: { message: "Company created successfully", company_id: company.id }, status: :created
    else
      render json: { error: company.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def show_by_slug
    company = Company.find_by!(slug: params[:slug])
    render json: company.as_json
  end

  def jobs_by_slug
    company = Company.find_by!(slug: params[:slug])
    jobs = company.jobs.includes(:job_description)

    render json: jobs.as_json(include: { job_description: { include: :skills } })
  end
end

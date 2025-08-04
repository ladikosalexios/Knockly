class Api::CompaniesController < ApplicationController
  # ✅ Require the user to be logged in
before_action :authenticate_user!

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
end

class Api::JobApplicationsController < ApplicationController
  def create
    job = Job.find(params[:job_id])
    application = job.job_applications.new(name: params[:name], email: params[:email])
    if application.save
      render json: { status: "ok", application: application }, status: :created
    else
      render json: { errors: application.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def index
    apps = JobApplication.all
    render json: apps
  end
end

class Api::InterviewsController < ApplicationController
  before_action :set_interview, only: [:show, :update, :destroy]

  def index
    interviews = Interview.all
    interviews = interviews.where(job_application_id: params[:job_application_id]) if params[:job_application_id]
    render json: interviews
  end

  def show
    render json: @interview
  end

  def create
    @interview = Interview.new(interview_params)
    if @interview.save
      InterviewMailer.calendar_invite(@interview).deliver_later
      render json: @interview, status: :created
    else
      render json: { errors: @interview.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @interview.update(interview_params)
      InterviewMailer.calendar_invite(@interview).deliver_later
      render json: @interview
    else
      render json: { errors: @interview.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @interview.destroy
    head :no_content
  end

  private

  def set_interview
    @interview = Interview.find(params[:id])
  end

  def interview_params
    params.require(:interview).permit(:job_application_id, :scheduled_at, :location, :notes)
  end
end

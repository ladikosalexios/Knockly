class Api::InterviewsController < ApplicationController
  before_action :set_interview, only: [:show, :update, :destroy]

  def index
    interviews = Interview.includes(:interview_template, :scorecards, job_application: { job: :posted_by_user })
    interviews = interviews.where(job_application_id: params[:job_application_id]) if params[:job_application_id]
    render json: interviews.as_json(include: {
      interview_template: {},
      scorecards: { include: { evaluator: { only: [:id, :name, :email] } } },
      job_application: {
        only: [:id, :name],
        include: { job: { include: { posted_by_user: { only: [:id, :name, :email] } } } }
      }
    })
  end

  def show
    render json: @interview.as_json(include: {
      interview_template: {},
      scorecards: { include: { evaluator: { only: [:id, :name, :email] } } }
    })
  end

  def create
    @interview = Interview.new(interview_params)
    if @interview.save
      @interview.job_application.update(status: :interviewed)
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
    params.require(:interview).permit(:job_application_id, :scheduled_at, :location, :notes, :interview_template_id)
  end
end

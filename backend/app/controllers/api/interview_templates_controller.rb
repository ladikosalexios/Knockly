class Api::InterviewTemplatesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_template, only: [:show, :update, :destroy]

  def index
    templates = InterviewTemplate.all
    templates = templates.where(job_id: params[:job_id]) if params[:job_id]
    render json: templates
  end

  def show
    render json: @template
  end

  def create
    @template = InterviewTemplate.new(template_params)
    if @template.save
      render json: @template, status: :created
    else
      render json: { errors: @template.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @template.update(template_params)
      render json: @template
    else
      render json: { errors: @template.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @template.destroy
    head :no_content
  end

  private

  def set_template
    @template = InterviewTemplate.find(params[:id])
  end

  def template_params
    params.require(:interview_template).permit(:title, :job_id, questions: [])
  end
end

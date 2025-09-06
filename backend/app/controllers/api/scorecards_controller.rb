class Api::ScorecardsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_scorecard, only: [:show, :update, :destroy]

  def index
    scorecards = Scorecard.includes(:evaluator)
    scorecards = scorecards.where(interview_id: params[:interview_id]) if params[:interview_id]
    render json: scorecards.as_json(include: { evaluator: { only: [:id, :name, :email] } })
  end

  def show
    render json: @scorecard.as_json(include: { evaluator: { only: [:id, :name, :email] } })
  end

  def create
    @scorecard = Scorecard.new(scorecard_params.merge(evaluator: current_user, submitted_at: Time.current))
    if @scorecard.save
      render json: @scorecard, status: :created
    else
      render json: { errors: @scorecard.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @scorecard.update(scorecard_params)
      render json: @scorecard
    else
      render json: { errors: @scorecard.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @scorecard.destroy
    head :no_content
  end

  private

  def set_scorecard
    @scorecard = Scorecard.find(params[:id])
  end

  def scorecard_params
    params.require(:scorecard).permit(:interview_id, :interview_template_id, responses: {})
  end
end

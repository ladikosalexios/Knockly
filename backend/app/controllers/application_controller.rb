class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session, if: -> { request.format.json? }
  before_action :authenticate_user!

  private

  def require_admin!
    unless current_user&.is_looply_admin?
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end

  def current_candidate
    @current_candidate ||= ApplicantProfile.find_by(id: session[:candidate_profile_id])
  end
  helper_method :current_candidate

  def require_candidate!
    unless current_candidate
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end
end


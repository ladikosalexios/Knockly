class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session, if: -> { request.format.json? }
  before_action :authenticate_user!

  private

  def require_admin!
    unless current_user&.is_looply_admin?
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end
end


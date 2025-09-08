class Api::CandidateSessionsController < ApplicationController
  skip_before_action :authenticate_user!

  def create
    profile = ApplicantProfile.find_by(portal_token: params[:token])
    if profile
      session[:candidate_profile_id] = profile.id
      render json: { id: profile.id, name: profile.name, email: profile.email }
    else
      render json: { error: 'Invalid token' }, status: :unauthorized
    end
  end

  def destroy
    session.delete(:candidate_profile_id)
    head :no_content
  end
end

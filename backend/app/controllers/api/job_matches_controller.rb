class Api::JobMatchesController < ApplicationController
  before_action :authenticate_user!

  def index
    job = Job.find(params[:job_id])
    jd = job.job_description
    matcher = JobMatcher.new(jd)
    matches = matcher.top_candidates(limit: params.fetch(:limit, 5).to_i)

    render json: matches.map { |m| serialize_match(m) }
  end

  private

  def serialize_match(match)
    profile = match[:applicant_profile]
    {
      applicant_profile: {
        id: profile.id,
        name: profile.name
      },
      score: match[:score]
    }
  end
end

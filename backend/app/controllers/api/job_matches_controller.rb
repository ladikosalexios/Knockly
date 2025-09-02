class Api::JobMatchesController < ApplicationController
  before_action :require_company!

  def index
    job = Job.where(company_id: current_user.company_id).find(params[:job_id])
    jd = job.job_description

    matches = JobMatcher.new(jd, company_id: job.company_id, exclude_job_id: job.id)
                    .top_candidates(limit: params.fetch(:limit, 5).to_i)

    render json: matches.map do |m|
      profile = m[:profile]
      score_data = MatchingService.score(
        applicant_profile: profile,
        job_description: jd,
        job_requirements: jd.requirements
      )

      profile.as_json(only: [:id, :name, :email]).merge(
        score: score_data[:score],
        reason: score_data[:reason],
        breakdown: score_data[:breakdown],
        explanation: score_data[:explanation]
      )
    end
  end

  private

  def require_company!
    return if current_user&.company_id.present?

    head :unauthorized
  end
end

class Api::JobMatchesController < ApplicationController
  def index
    job = Job.find(params[:job_id])
    jd = job.job_description
    unless jd&.embedding.present?
      render json: [] and return
    end

    matches = JobMatcher.new(jd).top_candidates(limit: params.fetch(:limit, 5).to_i)
    render json: matches.map { |m|
      profile = m[:profile]
      profile.as_json(only: [:id, :name, :email]).merge(score: m[:score])
    }
  end
end

class Api::ApplicantProfilesController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index]

  def index
    query = params[:q].to_s
    return render json: [] if query.blank?

    begin
      query_embedding = EmbeddingService.generate(query)
    rescue => e
      Rails.logger.error "[ApplicantProfiles] embedding failed: #{e.message}"
      return render json: [], status: :internal_server_error
    end

    profiles = ApplicantProfile.includes(:skills).where.not(embedding: nil)

    results = profiles.map do |profile|
      similarity = EmbeddingService.cosine_similarity(query_embedding, profile.embedding)
      {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        skills: profile.skills.map(&:name),
        similarity: similarity
      }
    end.sort_by { |h| -h[:similarity] }

    render json: results
  end
end

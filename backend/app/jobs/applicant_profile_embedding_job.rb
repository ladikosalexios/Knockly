class ApplicantProfileEmbeddingJob < ApplicationJob
  queue_as :default

  def perform(applicant_profile_id, resume_text)
    return if resume_text.blank?

    profile = ApplicantProfile.find_by(id: applicant_profile_id)
    return unless profile

    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])
    response = client.embeddings(
      parameters: {
        model: "text-embedding-ada-002",
        input: resume_text
      }
    )

    profile.update_column(:embedding, response.dig("data", 0, "embedding"))
  rescue => e
    Rails.logger.error "Embedding error for ApplicantProfile #{applicant_profile_id}: #{e.message}"
  end
end

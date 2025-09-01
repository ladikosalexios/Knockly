class JobDescriptionEmbeddingJob < ApplicationJob
  queue_as :default

  def perform(job_description_id, text)
    return if text.blank?

    jd = JobDescription.find_by(id: job_description_id)
    return unless jd

    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])
    response = client.embeddings(
      parameters: {
        model: "text-embedding-ada-002",
        input: text
      }
    )

    jd.update_column(:embedding, response.dig("data", 0, "embedding"))
  rescue => e
    Rails.logger.error "Embedding error for JobDescription #{job_description_id}: #{e.message}"
  end
end

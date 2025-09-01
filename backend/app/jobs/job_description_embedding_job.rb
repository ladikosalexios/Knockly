class JobDescriptionEmbeddingJob < ApplicationJob
  queue_as :default

  def perform(job_description_id)
    jd = JobDescription.find_by(id: job_description_id)
    return unless jd&.description.present?

    response = OPENAI_CLIENT.embeddings(
      parameters: {
        model: "text-embedding-ada-002",
        input: jd.description
      }
    )

    jd.update_column(:embedding, response.dig("data", 0, "embedding"))
  rescue => e
    Rails.logger.error "Embedding error for JobDescription #{job_description_id}: #{e.message}"
  end
end

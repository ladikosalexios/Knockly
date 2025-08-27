class JobDescription < ApplicationRecord
  serialize :embedding, :json

  belongs_to :job
  has_many :job_description_skills
  has_many :skills, through: :job_description_skills

  after_save :generate_embedding, if: :saved_change_to_description?

  def generate_embedding
    return if description.blank?

    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])
    response = client.embeddings(parameters: {
      model: "text-embedding-ada-002",
      input: description
    })

    update_column(:embedding, response.dig("data", 0, "embedding"))
  rescue => e
    Rails.logger.error "Embedding error for JobDescription #{id}: #{e.message}"
  end
end

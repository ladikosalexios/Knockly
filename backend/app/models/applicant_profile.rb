class ApplicantProfile < ApplicationRecord
  attr_accessor :resume_text

  has_many :applicant_experiences, dependent: :destroy
  has_many :applicant_educations, dependent: :destroy
  has_many :applicant_profile_skills, dependent: :destroy
  has_many :skills, through: :applicant_profile_skills
  has_many :job_applications

  validates :email, presence: true
  validates :name, presence: true

  after_save :generate_embedding, if: -> { resume_text.present? }

  def generate_embedding
    return if resume_text.blank?

    client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])
    response = client.embeddings(parameters: {
      model: "text-embedding-ada-002",
      input: resume_text
    })

    update_column(:embedding, response.dig("data", 0, "embedding"))
  rescue => e
    Rails.logger.error "Embedding error for ApplicantProfile #{id}: #{e.message}"
  end
end

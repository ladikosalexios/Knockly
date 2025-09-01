class JobDescription < ApplicationRecord
  belongs_to :job
  has_many :job_description_skills
  has_many :skills, through: :job_description_skills

  after_commit :enqueue_embedding_generation, on: [:create, :update]

  private

  def enqueue_embedding_generation
    text = [title, description, requirements].compact.join("\n")
    return if text.blank?

    JobDescriptionEmbeddingJob.perform_later(id, text)
  end
end

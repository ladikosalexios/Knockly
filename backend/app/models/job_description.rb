class JobDescription < ApplicationRecord
  belongs_to :job
  has_many :job_description_skills
  has_many :skills, through: :job_description_skills

  validates :title, presence: true
  validates :description, presence: true
  validates :location, presence: true, unless: :is_remote?
  validates :salary_max, numericality: { greater_than_or_equal_to: :salary_min }, if: -> { salary_min.present? && salary_max.present? }
  validates :years_experience_max, numericality: { greater_than_or_equal_to: :years_experience_min }, if: -> { years_experience_min.present? && years_experience_max.present? }

  after_commit :enqueue_embedding_generation,
               if: -> { saved_change_to_description? && description.present? }

  private

  def enqueue_embedding_generation
    JobDescriptionEmbeddingJob.perform_later(id)
  end
end

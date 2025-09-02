class JobDescription < ApplicationRecord
  belongs_to :job
  has_many :job_description_skills
  has_many :skills, through: :job_description_skills

  after_commit :enqueue_embedding_generation,
               if: -> { saved_change_to_description? && description.present? }
  after_commit :enqueue_match_recomputation,
               if: -> { saved_change_to_embedding? }

  private

  def enqueue_embedding_generation
    JobDescriptionEmbeddingJob.perform_later(id)
  end

  def enqueue_match_recomputation
    RecomputeMatchesJob.perform_later(id)
  end
end

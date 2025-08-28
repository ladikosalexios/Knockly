class ApplicantProfile < ApplicationRecord
  # Embedding is stored in a jsonb column; no serialization needed.
  attr_accessor :resume_text

  has_many :applicant_experiences, dependent: :destroy
  has_many :applicant_educations, dependent: :destroy
  has_many :applicant_profile_skills, dependent: :destroy
  has_many :skills, through: :applicant_profile_skills
  has_many :job_applications

  validates :email, presence: true
  validates :name, presence: true

  after_commit :enqueue_embedding_generation, if: -> { resume_text.present? }

  private

  def enqueue_embedding_generation
    ApplicantProfileEmbeddingJob.perform_later(id, resume_text)
  end
end

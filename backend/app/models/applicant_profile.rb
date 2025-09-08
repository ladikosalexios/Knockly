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

  before_validation :normalize_email
  before_save :ensure_portal_token

  after_commit :enqueue_embedding_generation, if: -> { resume_text.present? }
  after_commit :enqueue_match_recomputation, if: -> { saved_change_to_embedding? }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end

  def enqueue_embedding_generation
    ApplicantProfileEmbeddingJob.perform_later(id, resume_text)
  end

  def enqueue_match_recomputation
    job_applications.includes(job: :job_description).find_each do |application|
      jd_id = application.job.job_description&.id
      RecomputeMatchesJob.perform_later(jd_id) if jd_id
    end
  end

  def ensure_portal_token
    self.portal_token ||= SecureRandom.hex(20)
  end
end

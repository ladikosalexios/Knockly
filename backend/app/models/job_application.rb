class JobApplication < ApplicationRecord
  belongs_to :job
  belongs_to :applicant_profile, optional: true

  validates :name, :email, presence: true
  validates :email, uniqueness: { scope: :job_id, message: "already applied for this job" }
end
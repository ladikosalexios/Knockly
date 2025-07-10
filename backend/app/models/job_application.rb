# app/models/job_application.rb
class JobApplication < ApplicationRecord
  belongs_to :job
  validates :name, :email, presence: true
  validates :email, uniqueness: { scope: :job_id, message: "already applied for this job" }
end

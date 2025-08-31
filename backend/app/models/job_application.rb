class JobApplication < ApplicationRecord
  belongs_to :job
  belongs_to :applicant_profile, optional: true

  has_one_attached :resume_file

  enum :status, { submitted: 0, reviewed: 1, interviewed: 2, rejected: 3 }

  validates :name, :email, :phone, :work_authorization, presence: true
  validates :email, uniqueness: { scope: :job_id, message: "already applied for this job" }

  after_update :send_status_notification, if: :saved_change_to_status?

  private

  def send_status_notification
    JobApplicationMailer.status_changed(self).deliver_later
  end
end

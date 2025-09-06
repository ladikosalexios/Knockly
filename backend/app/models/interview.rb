class Interview < ApplicationRecord
  belongs_to :job_application
  belongs_to :interview_template, optional: true
  has_many :scorecards, dependent: :destroy

  validates :scheduled_at, :location, presence: true
end

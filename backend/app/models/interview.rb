class Interview < ApplicationRecord
  belongs_to :job_application

  validates :scheduled_at, :location, presence: true
end

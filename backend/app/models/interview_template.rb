class InterviewTemplate < ApplicationRecord
  belongs_to :job
  has_many :interviews
  has_many :scorecards

  validates :title, presence: true
end

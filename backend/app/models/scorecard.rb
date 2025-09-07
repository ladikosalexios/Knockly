class Scorecard < ApplicationRecord
  belongs_to :interview
  belongs_to :interview_template
  belongs_to :evaluator, class_name: "User"

  validates :responses, presence: true
end

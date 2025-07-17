class Job < ApplicationRecord
  belongs_to :company
  belongs_to :posted_by_user, class_name: "User"
  belongs_to :job_description
  has_many :job_applications
end
class Job < ApplicationRecord
  belongs_to :company
  belongs_to :posted_by_user, class_name: "User"
  has_many :job_skills
  has_many :skills, through: :job_skills
end

class Job < ApplicationRecord
  belongs_to :company
  belongs_to :posted_by_user, class_name: "User"
  has_one :job_description, dependent: :destroy
  has_many :job_applications
  has_many :interview_templates
  has_many :job_post_variants, dependent: :destroy
end

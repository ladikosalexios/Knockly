class JobDescription < ApplicationRecord
  has_many :job_description_skills
  has_many :skills, through: :job_description_skills
end

class Skill < ApplicationRecord
  has_many :job_skills
  has_many :jobs, through: :job_skills
end

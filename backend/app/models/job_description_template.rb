class JobDescriptionTemplate < ApplicationRecord
  has_many :job_description_template_skills
  has_many :skills, through: :job_description_template_skills
end

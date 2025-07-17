class JobDescriptionSkill < ApplicationRecord
  belongs_to :job_description
  belongs_to :skill
end
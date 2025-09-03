class JobDescriptionTemplateSkill < ApplicationRecord
  belongs_to :job_description_template
  belongs_to :skill
end

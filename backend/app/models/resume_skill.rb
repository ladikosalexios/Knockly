class ResumeSkill < ApplicationRecord
  belongs_to :candidate_resume
  belongs_to :skill
end

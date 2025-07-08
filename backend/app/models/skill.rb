class Skill < ApplicationRecord
  has_many :resume_skills
  has_many :candidate_resumes, through: :resume_skills
end

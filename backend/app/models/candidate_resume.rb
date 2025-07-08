class CandidateResume < ApplicationRecord
  has_many :resume_skills, dependent: :destroy
  has_many :skills, through: :resume_skills
end

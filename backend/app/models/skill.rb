class Skill < ApplicationRecord
  validates :name, presence: true, uniqueness: { case_sensitive: false }

  has_many :resume_skills
  has_many :candidate_resumes, through: :resume_skills
end

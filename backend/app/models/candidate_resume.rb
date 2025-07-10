class CandidateResume < ApplicationRecord
  has_many :resume_skills, dependent: :destroy
  has_many :skills, through: :resume_skills

  validates :job_title, presence: true
  validates :description, presence: true
  validates :years_experience_min, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :years_experience_max, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: :years_experience_min }
end

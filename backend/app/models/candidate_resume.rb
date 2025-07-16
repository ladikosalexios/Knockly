class CandidateResume < ApplicationRecord
  belongs_to :user

  has_many :resume_skills, dependent: :destroy
  has_many :skills, through: :resume_skills

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :resume_text, presence: true
  validates :job_title, presence: true, allow_nil: true
  validates :description, presence: true, allow_nil: true
  validates :years_experience_min, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :years_experience_max, numericality: { only_integer: true, greater_than_or_equal_to: :years_experience_min }, allow_nil: true
end

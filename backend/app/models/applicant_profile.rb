class ApplicantProfile < ApplicationRecord
  has_many :applicant_experiences, dependent: :destroy
  has_many :applicant_educations, dependent: :destroy
  has_many :applicant_profile_skills, dependent: :destroy
  has_many :skills, through: :applicant_profile_skills
  has_many :job_applications

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end
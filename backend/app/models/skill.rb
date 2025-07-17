class Skill < ApplicationRecord
  before_validation { self.name = name.downcase.strip if name }
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  has_many :job_description_skills
  has_many :job_descriptions, through: :job_description_skills
end
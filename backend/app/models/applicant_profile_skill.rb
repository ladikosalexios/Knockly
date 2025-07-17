class ApplicantProfileSkill < ApplicationRecord
  belongs_to :applicant_profile
  belongs_to :skill
end
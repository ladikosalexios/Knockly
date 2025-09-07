class JobPostVariant < ApplicationRecord
  belongs_to :job

  validates :title, presence: true
  validates :description, presence: true
end

class JobPostVariant < ApplicationRecord
  belongs_to :job

  validates :copy, presence: true
end

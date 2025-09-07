class AnalyticsSnapshot < ApplicationRecord
  validates :date, presence: true, uniqueness: true
end

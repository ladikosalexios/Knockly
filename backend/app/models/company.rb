class Company < ApplicationRecord
  has_many :users
  has_many :jobs
  validates :name, presence: true
end
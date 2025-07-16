class Company < ApplicationRecord
  has_many :company_users
  has_many :users, through: :company_users
  has_many :jobs

  validates :name, presence: true
end

class User < ApplicationRecord
  has_secure_password

  has_many :company_users
  has_many :companies, through: :company_users
  has_many :jobs, foreign_key: :posted_by_user_id
end

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :company_users
  has_many :companies, through: :company_users
  has_many :jobs, foreign_key: :posted_by_user_id
  has_one :candidate_resume

  validates :email, presence: true, uniqueness: true
end

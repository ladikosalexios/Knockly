class User < ApplicationRecord
  belongs_to :company
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :jobs, foreign_key: :posted_by_user_id
  validates :email, presence: true, uniqueness: true
end
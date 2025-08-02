class User < ApplicationRecord
  belongs_to :company

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :jobs, foreign_key: :posted_by_user_id

  validates :email, presence: true, uniqueness: true
  validates :invite_token, uniqueness: true, allow_nil: true

  before_create :generate_api_key

  private

  def generate_api_key
    self.api_key ||= SecureRandom.hex(20)
  end
end
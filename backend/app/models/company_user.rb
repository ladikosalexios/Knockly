class CompanyUser < ApplicationRecord
  belongs_to :company
  belongs_to :user

  validates :role, presence: true
  validates :company_id, uniqueness: { scope: :user_id }
end

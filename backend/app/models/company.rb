class Company < ApplicationRecord
  has_many :users
  has_many :jobs
  before_validation :generate_slug, on: :create
  validates :name, presence: true

  def generate_slug
    self.slug ||= name.parameterize
  end
end
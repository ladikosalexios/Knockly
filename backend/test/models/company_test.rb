require "test_helper"

class CompanyTest < ActiveSupport::TestCase
  test "slug is generated from name" do
    company = Company.create!(name: "Acme Inc")

    assert_equal "acme-inc", company.slug
  end
end

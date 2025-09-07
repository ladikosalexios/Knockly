require "test_helper"

class JobPostVariantTest < ActiveSupport::TestCase
  test "requires title and description" do
    company = Company.create!(name: "Co")
    user = User.create!(email: "u@example.com", password: "password", company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    variant = JobPostVariant.new(job: job)
    assert_not variant.valid?
    assert_includes variant.errors[:title], "can't be blank"
    assert_includes variant.errors[:description], "can't be blank"
  end

  test "defaults counters to zero" do
    company = Company.create!(name: "Co")
    user = User.create!(email: "u@example.com", password: "password", company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    variant = JobPostVariant.create!(job: job, title: "A", description: "Desc")
    assert_equal 0, variant.view_count
    assert_equal 0, variant.click_count
    assert_equal 0, variant.apply_count
    assert_not variant.active
  end
end

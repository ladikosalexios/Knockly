require "test_helper"

class JobPostVariantTest < ActiveSupport::TestCase
  test "requires copy" do
    company = Company.create!(name: "Co")
    user = User.create!(email: "u@example.com", password: "password", company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    variant = JobPostVariant.new(job: job)
    assert_not variant.valid?
    assert_includes variant.errors[:copy], "can't be blank"
  end

  test "defaults counters to zero" do
    company = Company.create!(name: "Co")
    user = User.create!(email: "u@example.com", password: "password", company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    variant = JobPostVariant.create!(job: job, copy: "A")
    assert_equal 0, variant.view_count
    assert_equal 0, variant.click_count
    assert_equal 0, variant.apply_count
    assert_not variant.active
  end
end

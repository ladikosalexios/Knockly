require "test_helper"

class JobMatcherTest < ActiveSupport::TestCase
  setup do
    user = User.create!(email: "u@e.com", password: "password")
    company = Company.create!(name: "Co")
    job = Job.create!(title: "Dev", status: "active", company: company, posted_by_user: user)
    @jd = JobDescription.create!(job: job, description: "desc", embedding: [1.0, 0.0])
    @p1 = ApplicantProfile.create!(name: "Alice", email: "a@example.com", embedding: [1.0, 0.0])
    @p2 = ApplicantProfile.create!(name: "Bob", email: "b@example.com", embedding: [0.0, 1.0])
  end

  test "returns candidates ordered by similarity" do
    matches = JobMatcher.new(@jd).top_candidates(limit: 2)
    assert_equal [@p1, @p2], matches.map { |m| m[:profile] }
    assert matches.first[:score] > matches.last[:score]
  end
end

require "test_helper"

class JobMatcherTest < ActiveSupport::TestCase
  setup do
    user = User.create!(email: "u@e.com", password: "password")
    company = Company.create!(name: "Co")
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    @jd = JobDescription.create!(job: job, description: "desc", embedding: [1.0, 0.0])
    @p1 = ApplicantProfile.create!(name: "Alice", email: "a@example.com", embedding: [1.0, 0.0])
    @p2 = ApplicantProfile.create!(name: "Bob", email: "b@example.com", embedding: [0.0, 1.0])
    [@p1, @p2].each do |p|
      JobApplication.create!(job: job, applicant_profile: p, name: p.name, email: p.email,
                            phone: "123", work_authorization: "citizen")
    end
    other_user = User.create!(email: "other@e.com", password: "password")
    other_company = Company.create!(name: "OtherCo")
    other_job = Job.create!(status: "active", company: other_company, posted_by_user: other_user)
    @p3 = ApplicantProfile.create!(name: "Eve", email: "e@example.com", embedding: [1.0, 1.0])
    JobApplication.create!(job: other_job, applicant_profile: @p3, name: @p3.name, email: @p3.email,
                          phone: "123", work_authorization: "citizen")
  end

  test "returns candidates ordered by similarity" do
    matches = JobMatcher.new(@jd, company_id: @jd.job.company_id).top_candidates(limit: 3)
    assert_equal [@p1, @p2], matches.map { |m| m[:profile] }
    assert_equal 100, matches.first[:score].round
    assert_equal 0, matches.last[:score].round
    refute_includes matches.map { |m| m[:profile] }, @p3
  end

  test "falls back to MatchingService when job description lacks embedding" do
    @jd.update!(embedding: nil)

    stub = ->(applicant_profile:, job_description:, job_requirements:) {
      { score: applicant_profile == @p1 ? 80 : 20 }
    }

    matches = nil
    MatchingService.stub :score, stub do
      matches = JobMatcher.new(@jd, company_id: @jd.job.company_id).top_candidates(limit: 3)
    end

    assert_equal [@p1, @p2], matches.map { |m| m[:profile] }
    assert_equal [80, 20], matches.map { |m| m[:score] }
  end
end

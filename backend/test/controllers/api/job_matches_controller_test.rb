require "test_helper"

class Api::JobMatchesControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.create!(email: "u@e.com", password: "password")
    @company = Company.create!(name: "Co")
    @user.update!(company: @company)
    sign_in @user, scope: :user

    @job = Job.create!(status: "active", company: @company, posted_by_user: @user)
    @jd = JobDescription.create!(job: @job, title: "T", description: "desc", location: "NYC", embedding: [1.0, 0.0])

    # Applicant applied to this job (should not appear)
    applied = ApplicantProfile.create!(name: "Applied", email: "applied@example.com", embedding: [1.0, 0.0])
    JobApplication.create!(job: @job, applicant_profile: applied, name: applied.name,
                          email: applied.email, phone: "123", work_authorization: "citizen")

    # Another job in same company with candidates that should appear
    @other_job = Job.create!(status: "active", company: @company, posted_by_user: @user)
    ApplicantProfile.create!(name: "Alice", email: "a@example.com", embedding: [1.0, 0.0]).tap do |p|
      JobApplication.create!(job: @other_job, applicant_profile: p, name: p.name, email: p.email,
                            phone: "123", work_authorization: "citizen")
    end
    ApplicantProfile.create!(name: "Bob", email: "b@example.com", embedding: [0.0, 1.0]).tap do |p|
      JobApplication.create!(job: @other_job, applicant_profile: p, name: p.name, email: p.email,
                            phone: "123", work_authorization: "citizen")
    end
  end

  test "returns candidates from other jobs" do
    get "/api/jobs/#{@job.id}/matches"
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 2, body.length
    names = body.map { |c| c["name"] }
    assert_includes names, "Alice"
    assert_includes names, "Bob"
    refute_includes names, "Applied"
  end

  test "rejects matches for unauthorized job" do
    other_company = Company.create!(name: "OtherCo")
    other_job = Job.create!(status: "active", company: other_company, posted_by_user: @user)
    JobDescription.create!(job: other_job, title: "T", description: "desc", location: "NYC", embedding: [1.0, 0.0])
    get "/api/jobs/#{other_job.id}/matches"
    assert_response :not_found
  end

  test "requires company for matches" do
    sign_out @user
    user_without_company = User.create!(email: "no@company.com", password: "password")
    sign_in user_without_company, scope: :user

    get "/api/jobs/#{@job.id}/matches"
    assert_response :unauthorized
  end
end

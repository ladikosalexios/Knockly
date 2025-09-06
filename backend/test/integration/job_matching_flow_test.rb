require "test_helper"

class JobMatchingFlowTest < ActionDispatch::IntegrationTest
  include Warden::Test::Helpers

  setup do
    @company = Company.create!(name: "Co")
    @user = User.create!(email: "u@example.com", password: "password", company: @company)
    @job = Job.create!(status: "active", company: @company, posted_by_user: @user)
    @jd = JobDescription.create!(job: @job, title: "T", description: "desc", location: "NYC", embedding: [1.0, 0.0])

    other_job = Job.create!(status: "active", company: @company, posted_by_user: @user)
    @p1 = ApplicantProfile.create!(name: "Alice", email: "a@example.com", embedding: [1.0, 0.0])
    @p2 = ApplicantProfile.create!(name: "Bob", email: "b@example.com", embedding: [0.0, 1.0])
    [@p1, @p2].each do |p|
      JobApplication.create!(job: other_job, applicant_profile: p, name: p.name,
                            email: p.email, phone: "123", work_authorization: "citizen")
    end

    profile = ApplicantProfile.create!(name: "Carol", email: "c@example.com", embedding: [1.0, 0.0])
    @feedback_application = JobApplication.create!(job: @job, applicant_profile: profile, name: profile.name,
                                                   email: profile.email, phone: "123", work_authorization: "citizen")
  end

  teardown do
    Warden.test_reset!
  end

  test "job matches endpoint returns candidates" do
    login_as(@user, scope: :user)
    get "/api/jobs/#{@job.id}/matches", as: :json
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal [@p1.name, @p2.name], body.map { |m| m["name"] }
    assert_equal 100, body.first["score"].round
    assert_equal 0, body.last["score"].round
  end

  test "feedback endpoint not found" do
    login_as(@user, scope: :user)
    post "/api/job_applications/#{@feedback_application.id}/feedback", params: { feedback: "Great" }, as: :json
    assert_response :bad_request
  end
end

require "test_helper"

class Api::JobApplicationsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include Warden::Test::Helpers

  setup do
    @user = User.create!(email: "u@e.com", password: "password")
    @company = Company.create!(name: "Co")
    @user.update!(company: @company)
    sign_in @user, scope: :user

    @job = Job.create!(status: "active", company: @company, posted_by_user: @user)
    JobDescription.create!(job: @job, title: "T", description: "desc", location: "NYC")
    @profile = ApplicantProfile.create!(name: "Alice", email: "a@example.com", embedding: [1.0, 0.0])
    @job_application = JobApplication.create!(job: @job, applicant_profile: @profile,
                                   name: @profile.name, email: @profile.email,
                                   phone: "123", work_authorization: "citizen")
  end

  teardown do
    Warden.test_reset!
  end

  test "returns applications for job belonging to company" do
    get "/api/job_applications", params: { job_id: @job.id }
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 1, body.length
    assert_equal @job_application.id, body.first["id"]
  end

  test "does not return applications for other company's job" do
    other_company = Company.create!(name: "OtherCo")
    other_user = User.create!(email: "other@e.com", password: "password")
    other_job = Job.create!(status: "active", company: other_company, posted_by_user: other_user)
    JobApplication.create!(job: other_job, applicant_profile: @profile,
                           name: "Eve", email: "eve@example.com",
                           phone: "123", work_authorization: "citizen")
    get "/api/job_applications", params: { job_id: other_job.id }
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 0, body.length
  end

  test "returns unauthorized when user lacks company" do
    sign_out @user
    user2 = User.create!(email: "no@e.com", password: "password")
    login_as(user2, scope: :user)

    get "/api/job_applications"
    assert_response :unauthorized
  end

  test "records recruiter feedback" do
    post "/api/job_applications/#{@job_application.id}/feedback",
         params: { job_application: { fit_feedback: 10 } }
    assert_response :success
    assert_equal 10, @job_application.reload.fit_feedback
  end
end

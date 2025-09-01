require "test_helper"

class Api::JobMatchesControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.create!(email: "u@e.com", password: "password")
    @company = Company.create!(name: "Co")
    @user.update!(company: @company)
    sign_in @user

    @job = Job.create!(title: "Dev", status: "active", company: @company, posted_by_user: @user)
    @jd = JobDescription.create!(job: @job, description: "desc", embedding: [1.0, 0.0])
    ApplicantProfile.create!(name: "Alice", email: "a@example.com", embedding: [1.0, 0.0])
    ApplicantProfile.create!(name: "Bob", email: "b@example.com", embedding: [0.0, 1.0])
  end

  test "returns top matches" do
    get "/api/jobs/#{@job.id}/matches"
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 2, body.length
    assert_equal "Alice", body.first["name"]
    assert body.first.key?("score")
  end

  test "rejects matches for unauthorized job" do
    other_company = Company.create!(name: "OtherCo")
    other_job = Job.create!(title: "Other", status: "active", company: other_company, posted_by_user: @user)
    JobDescription.create!(job: other_job, description: "desc", embedding: [1.0, 0.0])
    get "/api/jobs/#{other_job.id}/matches"
    assert_response :not_found
  end
end

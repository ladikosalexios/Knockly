require "test_helper"

class Api::JobMatchesControllerTest < ActionDispatch::IntegrationTest
  setup do
    user = User.create!(email: "u@e.com", password: "password")
    company = Company.create!(name: "Co")
    @job = Job.create!(title: "Dev", status: "active", company: company, posted_by_user: user)
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
end

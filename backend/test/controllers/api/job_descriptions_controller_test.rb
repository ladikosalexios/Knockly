require "test_helper"

class Api::JobDescriptionsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @user = User.create!(email: "u@e.com", password: "password")
    @company = Company.create!(name: "Co")
    @user.update!(company: @company)
    sign_in @user, scope: :user
    @job = Job.create!(status: "active", company: @company, posted_by_user: @user)
  end

  test "status returns skill count and generated state" do
    jd = JobDescription.create!(job: @job, title: "T", description: "desc", embedding: [1.0])
    skill = Skill.create!(name: "ruby")
    jd.skills << skill

    get "/api/job_descriptions/#{jd.id}/status"
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 1, body["skill_count"]
    assert_equal "generated", body["embedding_state"]
  end

  test "status reports pending without embedding" do
    jd = JobDescription.create!(job: @job, title: "T", description: "desc")
    get "/api/job_descriptions/#{jd.id}/status"
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal "pending", body["embedding_state"]
  end
end

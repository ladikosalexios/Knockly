require "test_helper"

class Api::Admin::DashboardControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include Warden::Test::Helpers

  setup do
    @company = Company.create!(name: "Co")
    @user = User.create!(email: "u@e.com", password: "password", company: @company)
    sign_in @user, scope: :user
    @job1 = Job.create!(status: "active", company: @company, posted_by_user: @user)
    JobDescription.create!(job: @job1, title: "Job1", description: "Desc", requirements: "Req", location: "NY", is_remote: false, job_type: "full-time", salary_min: 0, salary_max: 0, salary_currency: "USD", years_experience_min: 1, years_experience_max: 2)
    @job1.job_post_variants.create!(title: "Var", description: "Desc")
    @job2 = Job.create!(status: "active", company: @company, posted_by_user: @user)
    JobDescription.create!(job: @job2, title: "Job2", description: "Desc2", requirements: "Req2", location: "SF", is_remote: true, job_type: "contract", salary_min: 0, salary_max: 0, salary_currency: "USD", years_experience_min: 3, years_experience_max: 5)
  end

  teardown do
    Warden.test_reset!
  end

  test "includes variant count for jobs" do
    get "/api/admin/dashboard"
    assert_response :success
    body = JSON.parse(@response.body)
    job1_data = body.find { |j| j["id"] == @job1.id }
    job2_data = body.find { |j| j["id"] == @job2.id }
    assert_equal 1, job1_data["variant_count"]
    assert_equal 0, job2_data["variant_count"]
  end
end


require "test_helper"

class JobDescriptionsFlowTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @company = Company.create!(name: "Co")
    @user = User.create!(email: "user@example.com", password: "password", company: @company)
    sign_in @user
  end

  test "creates a job description" do
    job = Job.create!(status: "active", company: @company, posted_by_user: @user)

    assert_difference("JobDescription.count", 1) do
      post "/api/job_descriptions", params: {
        job_id: job.id,
        title: "Engineer",
        description: "Build stuff",
        location: "NYC",
        skills: ["ruby"],
        requirements: ["req1"]
      }
    end

    assert_response :created
    body = JSON.parse(@response.body)
    assert_equal "Engineer", body["title"]
  end

  test "updates a job description" do
    job = Job.create!(status: "active", company: @company, posted_by_user: @user)
    jd = JobDescription.create!(job: job, title: "Old", description: "desc", location: "NYC")

    put "/api/job_descriptions/#{jd.id}", params: {
      title: "New",
      description: "New desc",
      location: "Remote",
      skills: ["rails"]
    }

    assert_response :success
    jd.reload
    assert_equal "New", jd.title
    assert_equal ["rails"], jd.skills.pluck(:name)
  end

  test "import endpoint returns not found" do
    post "/api/job_descriptions/import"
    assert_response :not_found
  end

  test "export endpoint returns not found" do
    get "/api/job_descriptions/export"
    assert_response :not_found
  end
end

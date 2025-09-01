require "test_helper"

class Api::InterviewsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @job_application = job_applications(:one)
    @interview = interviews(:one)
  end

  test "should get index" do
    get "/api/interviews", as: :json
    assert_response :success
  end

  test "should create interview" do
    assert_difference("Interview.count") do
      post "/api/interviews", params: { interview: { job_application_id: @job_application.id, scheduled_at: Time.current, location: "Office" } }, as: :json
    end
    assert_response :created
  end
end

require "test_helper"

class Api::InterviewsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper
  include Devise::Test::IntegrationHelpers

  setup do
    @job_application = job_applications(:one)
    sign_in users(:one)
  end

  test "creates interview updates status and sends email" do
    assert_enqueued_emails 2 do
      post "/api/interviews", params: {
        interview: {
          job_application_id: @job_application.id,
          scheduled_at: "2025-09-01T12:00:00Z",
          location: "Zoom",
          notes: "Test",
        }
      }
    end
    assert_response :created
    @job_application.reload
    assert_equal "interviewed", @job_application.status
  end
end

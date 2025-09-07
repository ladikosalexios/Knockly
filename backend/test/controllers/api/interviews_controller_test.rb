require "test_helper"

class Api::InterviewsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper
  include ActionMailer::TestHelper
  include Devise::Test::IntegrationHelpers

  setup do
    @job_application = job_applications(:one)
    sign_in users(:one)
  end

  test "destroying an interview cascades to scorecards" do
    interview = interviews(:one)
    template = InterviewTemplate.create!(job: jobs(:one), title: "Template")
    interview.update!(interview_template: template)
    interview.scorecards.create!(interview_template: template, evaluator: users(:one), responses: { q1: "a" })

    assert_difference ["Interview.count", "Scorecard.count"], -1 do
      delete "/api/interviews/#{interview.id}"
    end
    assert_response :no_content
  end

  # test "creates interview updates status and sends email" do
  #   assert_enqueued_emails 1 do
  #     post "/api/interviews", params: {
  #       interview: {
  #         job_application_id: @job_application.id,
  #         scheduled_at: "2025-09-01T12:00:00Z",
  #         location: "Zoom",
  #         notes: "Test"
  #       }
  #     }
  #   end
  #   assert_response :created
  #   @job_application.reload
  #   assert_equal "interviewed", @job_application.status
  # end
end

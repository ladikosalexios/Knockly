require "test_helper"

class JobApplicationFlowTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  test "user submits job application and triggers resume extraction, record creation, and notification" do
    # Stub out expensive resume parsing operations
    Api::JobApplicationsController.class_eval do
      private

      def extract_resume_text(_file)
        "Extracted resume text"
      end

      def parse_resume_with_gpt(_text)
        {
          "name" => "Jane Doe",
          "email" => "jane@example.com",
          "phone" => "555-0000",
          "skills" => [],
          "experiences" => [],
          "educations" => []
        }
      end
    end

    job = jobs(:one)

    file = Tempfile.new(["resume", ".pdf"])
    file.write("dummy")
    file.rewind
    uploaded = Rack::Test::UploadedFile.new(file.path, "application/pdf", original_filename: "resume.pdf")

    assert_difference("JobApplication.count", 1) do
      post "/api/job_applications", params: {
        job_application: {
          job_id: job.id,
          name: "Jane Doe",
          email: "jane@example.com",
          phone: "555-0000",
          work_authorization: "citizen",
          resume_file: uploaded
        }
      }
    end
    assert_response :created

    application = JobApplication.last
    assert_equal "Extracted resume text", application.resume_text

    perform_enqueued_jobs do
      assert_difference -> { ActionMailer::Base.deliveries.size }, 1 do
        application.update!(status: :reviewed)
      end
    end
  end
end

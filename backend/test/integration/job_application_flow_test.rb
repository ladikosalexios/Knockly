require "test_helper"

class JobApplicationFlowTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  test "user submits job application and triggers resume extraction, record creation, and notification" do
    controller = Api::JobApplicationsController
    original_extract = controller.instance_method(:extract_resume_text)
    original_parse = controller.instance_method(:parse_resume_with_gpt)

    controller.class_eval do
      define_method(:extract_resume_text) { |_file| "Extracted resume text" }
      define_method(:parse_resume_with_gpt) do |_text|
        {
          "name" => "Jane Doe",
          "email" => "jane@example.com",
          "phone" => "555-0000",
          "skills" => [],
          "experiences" => [],
          "educations" => []
        }
      end
      private :extract_resume_text, :parse_resume_with_gpt
    end

    begin
      company = Company.create!(name: "Co")
      user = User.create!(email: "poster@example.com", password: "password", company: company)
      job = Job.create!(status: "active", company: company, posted_by_user: user)
      JobDescription.create!(job: job, title: "T", description: "D", location: "NYC")

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
    ensure
      controller.class_eval do
        define_method(:extract_resume_text, original_extract)
        define_method(:parse_resume_with_gpt, original_parse)
        private :extract_resume_text, :parse_resume_with_gpt
      end
    end
  end
end

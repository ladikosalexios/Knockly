require "test_helper"

class JobApplicationMailerTest < ActionMailer::TestCase
  test "status_changed" do
    job_application = job_applications(:one)

    email = nil
    assert_emails 1 do
      email = JobApplicationMailer.status_changed(job_application).deliver_now
    end

    assert_equal [job_application.email], email.to
    assert_equal "Your application status has been updated", email.subject
    assert_includes email.body.to_s, job_application.status
  end
end

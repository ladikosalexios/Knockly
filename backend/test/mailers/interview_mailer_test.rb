require "test_helper"

class InterviewMailerTest < ActionMailer::TestCase
  test "calendar_invite" do
    interview = interviews(:one)
    email = nil
    assert_emails 1 do
      email = InterviewMailer.calendar_invite(interview).deliver_now
    end
    assert_includes email.to, interview.job_application.email
    assert_includes email.to, interview.job_application.job.posted_by_user.email
    assert_equal "Interview Scheduled", email.subject
    assert email.attachments['interview.ics']
  end
end

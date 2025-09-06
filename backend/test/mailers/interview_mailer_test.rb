require "test_helper"

class InterviewMailerTest < ActionMailer::TestCase
  def build_interview
    company = Company.create!(name: "Co")
    user = User.create!(email: "u@example.com", password: "password", company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    JobDescription.create!(job: job, title: "T", description: "D", location: "NYC")
    profile = ApplicantProfile.create!(name: "A", email: "a@example.com")
    ja = JobApplication.create!(job: job, applicant_profile: profile, name: profile.name, email: profile.email, phone: "123", work_authorization: "citizen")
    Interview.create!(job_application: ja, scheduled_at: Time.current, location: "Zoom")
  end

  test "calendar_invite" do
    interview = build_interview
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

require "test_helper"

class JobApplicationMailerTest < ActionMailer::TestCase
  def build_job_application
    company = Company.create!(name: "Co")
    user = User.create!(email: "u@example.com", password: "password", company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    JobDescription.create!(job: job, title: "T", description: "D", location: "NYC")
    profile = ApplicantProfile.create!(name: "A", email: "a@example.com")
    JobApplication.create!(job: job, applicant_profile: profile, name: profile.name, email: profile.email, phone: "123", work_authorization: "citizen")
  end

  test "status_changed" do
    job_application = build_job_application

    email = nil
    assert_emails 1 do
      email = JobApplicationMailer.status_changed(job_application).deliver_now
    end

    assert_equal [job_application.email], email.to
    assert_equal "Your application status has been updated", email.subject
    assert_includes email.body.to_s, job_application.status
  end
end

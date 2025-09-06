require "test_helper"

class InterviewTest < ActiveSupport::TestCase
  def build_job_application
    company = Company.create!(name: "Co")
    user = User.create!(email: "u@example.com", password: "password", company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    JobDescription.create!(job: job, title: "T", description: "D", location: "NYC")
    profile = ApplicantProfile.create!(name: "A", email: "a@example.com")
    JobApplication.create!(job: job, applicant_profile: profile, name: profile.name, email: profile.email, phone: "123", work_authorization: "citizen")
  end

  test "valid with required attributes" do
    ja = build_job_application
    interview = Interview.new(job_application: ja, scheduled_at: Time.current, location: "Zoom")
    assert interview.valid?
  end

  test "invalid without scheduled_at" do
    ja = build_job_application
    interview = Interview.new(job_application: ja, location: "Zoom")
    assert_not interview.valid?
  end
end

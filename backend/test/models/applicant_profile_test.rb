require "test_helper"

class ApplicantProfileTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  test "enqueues embedding job when resume text present" do
    assert_enqueued_with(job: ApplicantProfileEmbeddingJob) do
      ApplicantProfile.create!(name: "John Doe", email: "john@example.com", resume_text: "My resume")
    end
  end

  test "enqueues match recomputation when embedding changes" do
    recruiter = User.create!(email: "r@example.com", password: "password")
    company = Company.create!(name: "Co")
    recruiter.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: recruiter)
    jd = JobDescription.create!(job: job, description: "desc", embedding: [0.1, 0.2])
    profile = ApplicantProfile.create!(name: "Jane", email: "jane@example.com")
    JobApplication.create!(job: job, applicant_profile: profile, name: profile.name,
                          email: profile.email, phone: "123", work_authorization: "citizen")
    assert_enqueued_with(job: RecomputeMatchesJob, args: [jd.id]) do
      profile.update!(embedding: [0.3, 0.4])
    end
  end

  test "does not enqueue match recomputation when embedding unchanged" do
    recruiter = User.create!(email: "r2@example.com", password: "password")
    company = Company.create!(name: "Co2")
    recruiter.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: recruiter)
    jd = JobDescription.create!(job: job, description: "desc", embedding: [0.1, 0.2])
    profile = ApplicantProfile.create!(name: "Janet", email: "janet@example.com", embedding: [0.1, 0.2])
    JobApplication.create!(job: job, applicant_profile: profile, name: profile.name,
                          email: profile.email, phone: "123", work_authorization: "citizen")

    clear_enqueued_jobs
    assert_no_enqueued_jobs only: RecomputeMatchesJob do
      profile.update!(name: "Janet Smith")
    end
  end
end

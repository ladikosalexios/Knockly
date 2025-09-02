require "test_helper"

class JobDescriptionTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  test "enqueues match recomputation when embedding changes" do
    user = User.create!(email: "u@example.com", password: "password")
    company = Company.create!(name: "Co")
    user.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    jd = JobDescription.create!(job: job, description: "desc")
    assert_enqueued_with(job: RecomputeMatchesJob, args: [jd.id]) do
      jd.update!(embedding: [0.1, 0.2])
    end
  end

  test "does not enqueue match recomputation when embedding unchanged" do
    user = User.create!(email: "u2@example.com", password: "password")
    company = Company.create!(name: "Co2")
    user.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    jd = JobDescription.create!(job: job, description: "desc", embedding: [0.1, 0.2])

    clear_enqueued_jobs
    assert_no_enqueued_with(job: RecomputeMatchesJob) do
      jd.update!(description: "new desc")
    end
  end
end

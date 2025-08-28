require "test_helper"

class ApplicantProfileTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  test "enqueues embedding job when resume text present" do
    assert_enqueued_with(job: ApplicantProfileEmbeddingJob) do
      ApplicantProfile.create!(name: "John Doe", email: "john@example.com", resume_text: "My resume")
    end
  end
end

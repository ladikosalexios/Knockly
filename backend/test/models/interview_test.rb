require "test_helper"

class InterviewTest < ActiveSupport::TestCase
  test "valid with required attributes" do
    interview = Interview.new(job_application: job_applications(:one), scheduled_at: Time.current, location: "Zoom")
    assert interview.valid?
  end

  test "invalid without scheduled_at" do
    interview = Interview.new(job_application: job_applications(:one), location: "Zoom")
    assert_not interview.valid?
  end
end

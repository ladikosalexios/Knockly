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

  test "destroying interview removes associated scorecards" do
    interview = interviews(:one)
    template = InterviewTemplate.create!(job: jobs(:one), title: "Template")
    interview.scorecards.create!(interview_template: template, evaluator: users(:one), responses: { q1: "a" })

    assert_difference("Scorecard.count", -1) do
      interview.destroy
    end
  end
end

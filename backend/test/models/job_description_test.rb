require "test_helper"

class JobDescriptionTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  #
  # Validation tests
  #
  def setup
    company = Company.create!(name: "Co1")
    user = User.create!(email: "poster@example.com", password: "password", company: company)
    @job = Job.create!(status: "active", company: company, posted_by_user: user)
  end

  test "valid job description" do
    jd = JobDescription.new(
      title: "Title",
      description: "Desc",
      location: "NYC",
      job: @job,
      salary_min: 50,
      salary_max: 100,
      years_experience_min: 2,
      years_experience_max: 5
    )
    assert jd.valid?
  end

  test "requires title" do
    jd = JobDescription.new(description: "Desc", location: "NYC", job: @job)
    assert_not jd.valid?
    assert_includes jd.errors[:title], "can't be blank"
  end

  test "requires description" do
    jd = JobDescription.new(title: "Title", location: "NYC", job: @job)
    assert_not jd.valid?
    assert_includes jd.errors[:description], "can't be blank"
  end

  test "requires location when not remote" do
    jd = JobDescription.new(title: "Title", description: "Desc", is_remote: false, job: @job)
    assert_not jd.valid?
    assert_includes jd.errors[:location], "can't be blank"
  end

  test "allows blank location when remote" do
    jd = JobDescription.new(title: "Title", description: "Desc", is_remote: true, job: @job)
    assert jd.valid?
  end

  test "invalid when salary_min greater than salary_max" do
    jd = JobDescription.new(
      title: "Title",
      description: "Desc",
      location: "NYC",
      job: @job,
      salary_min: 200,
      salary_max: 100
    )
    assert_not jd.valid?
    assert jd.errors[:salary_max].any?
  end

  test "invalid when years_experience_min greater than years_experience_max" do
    jd = JobDescription.new(
      title: "Title",
      description: "Desc",
      location: "NYC",
      job: @job,
      years_experience_min: 5,
      years_experience_max: 3
    )
    assert_not jd.valid?
    assert jd.errors[:years_experience_max].any?
  end

  #
  # ActiveJob enqueue tests
  #
  test "enqueues match recomputation when embedding changes" do
    user = User.create!(email: "u@example.com", password: "password")
    company = Company.create!(name: "Co")
    user.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)

    # Include attributes required by validations so this record is valid.
    jd = JobDescription.create!(
      job: job,
      title: "Title",
      description: "desc",
      is_remote: true
    )

    assert_enqueued_with(job: RecomputeMatchesJob, args: [jd.id]) do
      jd.update!(embedding: [0.1, 0.2])
    end
  end

  test "does not enqueue match recomputation when embedding unchanged" do
    user = User.create!(email: "u2@example.com", password: "password")
    company = Company.create!(name: "Co3")
    user.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: user)

    jd = JobDescription.create!(
      job: job,
      title: "Title",
      description: "desc",
      is_remote: true,
      embedding: [0.1, 0.2]
    )

    clear_enqueued_jobs
    assert_no_enqueued_jobs only: RecomputeMatchesJob do
      jd.update!(description: "new desc")
    end
  end
end
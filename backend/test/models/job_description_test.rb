require "test_helper"

class JobDescriptionTest < ActiveSupport::TestCase
  def setup
    @job = jobs(:one)
  end

  test "valid job description" do
    jd = JobDescription.new(title: "Title", description: "Desc", location: "NYC", job: @job,
                             salary_min: 50, salary_max: 100,
                             years_experience_min: 2, years_experience_max: 5)
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
    jd = JobDescription.new(title: "Title", description: "Desc", location: "NYC", job: @job,
                             salary_min: 200, salary_max: 100)
    assert_not jd.valid?
    assert jd.errors[:salary_max].any?
  end

  test "invalid when years_experience_min greater than years_experience_max" do
    jd = JobDescription.new(title: "Title", description: "Desc", location: "NYC", job: @job,
                             years_experience_min: 5, years_experience_max: 3)
    assert_not jd.valid?
    assert jd.errors[:years_experience_max].any?
  end
end

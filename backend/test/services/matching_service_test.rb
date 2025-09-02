require "minitest/autorun"
require_relative "../../app/services/matching_service"

class MatchingServiceTest < Minitest::Test
  DummyProfile = Struct.new(:embedding, :total_years_experience, :location, :certifications)
  DummyJob     = Struct.new(:embedding, :description, :years_experience_min, :years_experience_max, :location, :is_remote)

  def test_score_returns_nil_without_job_description
    applicant = DummyProfile.new([1.0, 0.0, 0.0])
    result = MatchingService.score(applicant_profile: applicant, job_description: nil, job_requirements: "")
    assert_nil result[:score]
    assert_equal "Missing job description", result[:reason]
  end

  def test_score_with_zero_vector_returns_nil
    applicant = DummyProfile.new([0.0, 0.0, 0.0])
    job = DummyProfile.new([0.1, 0.2, 0.3])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_nil result[:score]
    assert_equal "Missing embeddings", result[:reason]
  end

  def test_score_with_valid_vectors
    applicant = DummyProfile.new([1.0, 0.0, 0.0])
    job = DummyProfile.new([1.0, 0.0, 0.0])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal 100, result[:score]
    expected_reason = "Perfect match — you'd be hard-pressed to find a better fit."
    assert_equal expected_reason, result[:reason]
  end

  def test_score_with_strong_match_vectors
    applicant = DummyProfile.new([1.0, 0.0])
    job = DummyProfile.new([0.8, 0.6])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal 80, result[:score]
    expected_reason = "Strong match — the candidate aligns well, though not flawlessly."
    assert_equal expected_reason, result[:reason]
  end

  def test_score_with_average_match_vectors
    applicant = DummyProfile.new([1.0, 0.0])
    job = DummyProfile.new([0.6, 0.8])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal 60, result[:score]
    expected_reason = "Average fit — some promising overlaps but room for improvement."
    assert_equal expected_reason, result[:reason]
  end

  def test_score_with_weak_match_vectors
    applicant = DummyProfile.new([1.0, 0.0])
    job = DummyProfile.new([0.3, 0.9539392014169456])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal 30, result[:score]
    expected_reason = "Weak match — the connection feels tenuous at best."
    assert_equal expected_reason, result[:reason]
  end

  def test_weighted_scoring_with_additional_attributes
    applicant = DummyProfile.new([1.0, 0.0], 5, "New York", ["AWS"])
    job = DummyJob.new([1.0, 0.0], "", 3, nil, "New York", false)

    result = MatchingService.score(
      applicant_profile: applicant,
      job_description: job,
      job_requirements: { required_certifications: ["AWS"] },
      weights: { skills: 0.0, experience: 1.0, location: 1.0, certifications: 1.0 }
    )

    assert_equal 100, result[:score]
  end
end

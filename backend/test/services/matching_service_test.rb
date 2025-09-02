require "minitest/autorun"
require_relative "../../app/services/matching_service"

class MatchingServiceTest < Minitest::Test
  DummyProfile = Struct.new(:embedding)

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

  def test_reason_threshold_boundaries
    applicant = DummyProfile.new([1.0, 0.0])

    job = DummyProfile.new([0.9, Math.sqrt(1 - 0.9**2)])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal 90, result[:score]
    assert_equal "Perfect match — you'd be hard-pressed to find a better fit.", result[:reason]

    job = DummyProfile.new([0.75, Math.sqrt(1 - 0.75**2)])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal 75, result[:score]
    assert_equal "Strong match — the candidate aligns well, though not flawlessly.", result[:reason]

    job = DummyProfile.new([0.5, Math.sqrt(1 - 0.5**2)])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal 50, result[:score]
    assert_equal "Average fit — some promising overlaps but room for improvement.", result[:reason]
  end

  def test_result_contains_score_and_reason
    applicant = DummyProfile.new([1.0, 0.0])
    job = DummyProfile.new([1.0, 0.0])
    result = MatchingService.score_with_embeddings(applicant_profile: applicant, job_description: job)
    assert_equal [:reason, :score], result.keys.sort
  end
end

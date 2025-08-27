require "minitest/autorun"
require_relative "../../app/services/matching_service"

class MatchingServiceTest < Minitest::Test
  DummyProfile = Struct.new(:embedding)

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
    assert_equal "Perfect match", result[:reason]
  end
end

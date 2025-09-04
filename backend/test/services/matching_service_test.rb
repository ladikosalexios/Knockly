require "test_helper"

class MatchingServiceTest < ActiveSupport::TestCase
  DummyProfile = Struct.new(:embedding, :total_years_experience, :location, :skills)
  DummyApplication = Struct.new(:fit_feedback)
  DummyProfileWithFeedback = Struct.new(:embedding, :job_applications)

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

  def test_score_adjusts_with_feedback
    apps = [DummyApplication.new(10), DummyApplication.new(0)]
    applicant = DummyProfileWithFeedback.new([1.0, 0.0], apps)
    job = DummyProfile.new([0.8, 0.6])
    result = MatchingService.score(applicant_profile: applicant, job_description: job, job_requirements: "")
    assert_equal 85, result[:score]
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

  def test_weighted_attributes_influence_score
    skill = Struct.new(:name)
    applicant = DummyProfile.new([1.0, 0.0], 2, "NYC", [ skill.new("aws") ])
    job_struct = Struct.new(:embedding, :years_experience_min, :location, :is_remote, :requirements) do
      def is_remote?
        is_remote
      end
    end
    job = job_struct.new([1.0, 0.0], 3, "NYC", false, [ "aws" ])

    result = MatchingService.score(
      applicant_profile: applicant,
      job_description: job,
      job_requirements: job.requirements,
      experience_weight: 1,
      location_weight: 1,
      certification_weight: 1
    )

    assert_equal 92, result[:score]
  end

  def test_negative_weights_clamped_to_zero
    skill = Struct.new(:name)
    applicant = DummyProfile.new([1.0, 0.0], 2, "NYC", [skill.new("aws")])
    job_struct = Struct.new(:embedding, :years_experience_min, :location, :is_remote, :requirements) do
      def is_remote?
        is_remote
      end
    end
    job = job_struct.new([1.0, 0.0], 3, "NYC", false, ["aws"])

    base = MatchingService.score(
      applicant_profile: applicant,
      job_description: job,
      job_requirements: job.requirements
    )[:score]

    result = MatchingService.score(
      applicant_profile: applicant,
      job_description: job,
      job_requirements: job.requirements,
      experience_weight: -1,
      location_weight: -2,
      certification_weight: -3
    )

    assert_equal base, result[:score]
  end
end

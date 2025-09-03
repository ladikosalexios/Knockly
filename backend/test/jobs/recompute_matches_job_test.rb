require "test_helper"

class RecomputeMatchesJobTest < ActiveJob::TestCase
  include ActionMailer::TestHelper

  test "caches matches and notifies recruiter for new high score" do
    recruiter = User.create!(email: "r@example.com", password: "password")
    company = Company.create!(name: "Co")
    recruiter.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: recruiter)
    jd = JobDescription.create!(job: job, description: "desc", embedding: [1.0, 0.0])
    profile = ApplicantProfile.create!(name: "Alice", email: "alice@example.com", embedding: [1.0, 0.0])

    cache_key = "job_matches:#{jd.id}"
    original_cache = Rails.cache
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
    Rails.cache.delete(cache_key)

    matches = [{ profile: profile, score: 85 }]
    matcher_class = Struct.new(:matches) do
      def top_candidates(limit: 5, exclude_profile_ids: [])
        matches.reject { |m| exclude_profile_ids.include?(m[:profile].id) }
      end
    end

    broadcasts = []
    JobMatcher.stub :new, ->(*args) { matcher_class.new(matches) } do
      ActionCable.server.stub :broadcast, ->(channel, payload) { broadcasts << [channel, payload] } do
        assert_emails 1 do
          perform_enqueued_jobs do
            RecomputeMatchesJob.perform_later(jd.id)
          end
        end
      end
    end

    expected_cache = { profile.id => 85 }
    assert_equal expected_cache, Rails.cache.read(cache_key)

    expected_payload = { job_id: job.id, applicant_profile_id: profile.id, score: 85 }
    assert_equal [["recruiter_notifications_#{recruiter.id}", expected_payload]], broadcasts
  ensure
    Rails.cache = original_cache
  end

  test "alerts when existing candidate crosses high score threshold" do
    recruiter = User.create!(email: "r2@example.com", password: "password")
    company = Company.create!(name: "Co2")
    recruiter.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: recruiter)
    jd = JobDescription.create!(job: job, description: "desc", embedding: [1.0, 0.0])
    profile = ApplicantProfile.create!(name: "Bob", email: "bob@example.com", embedding: [1.0, 0.0])

    cache_key = "job_matches:#{jd.id}"
    original_cache = Rails.cache
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
    Rails.cache.delete(cache_key)

    first_matches = [{ profile: profile, score: 70 }]
    second_matches = [{ profile: profile, score: 85 }]
    matcher_class = Class.new do
      def initialize(responses)
        @responses = responses
        @call = 0
      end

      def top_candidates(limit: 5, exclude_profile_ids: [])
        result = @responses[@call]
        @call += 1
        result.reject { |m| exclude_profile_ids.include?(m[:profile].id) }
      end
    end

    matcher = matcher_class.new([first_matches, second_matches])
    broadcasts = []
    JobMatcher.stub :new, matcher do
      ActionCable.server.stub :broadcast, ->(channel, payload) { broadcasts << [channel, payload] } do
        assert_emails 1 do
          perform_enqueued_jobs do
            RecomputeMatchesJob.perform_later(jd.id)
            RecomputeMatchesJob.perform_later(jd.id)
          end
        end
      end
    end

    assert_equal({ profile.id => 85 }, Rails.cache.read(cache_key))
    expected_payload = { job_id: job.id, applicant_profile_id: profile.id, score: 85 }
    assert_equal [["recruiter_notifications_#{recruiter.id}", expected_payload]], broadcasts
  ensure
    Rails.cache = original_cache
  end

  test "does not rescore candidates already notified" do
    recruiter = User.create!(email: "r2@example.com", password: "password")
    company = Company.create!(name: "Co2")
    recruiter.update!(company: company)
    job = Job.create!(status: "active", company: company, posted_by_user: recruiter)
    jd = JobDescription.create!(job: job, description: "desc", embedding: [1.0, 0.0])
    profile = ApplicantProfile.create!(name: "Bob", email: "bob@example.com", embedding: [1.0, 0.0])

    cache_key = "job_matches:#{jd.id}"
    original_cache = Rails.cache
    Rails.cache = ActiveSupport::Cache::MemoryStore.new
    Rails.cache.delete(cache_key)

    matches = [{ profile: profile, score: 90 }]
    calls = []
    matcher_class = Struct.new(:matches, :calls) do
      def top_candidates(limit: 5, exclude_profile_ids: [])
        calls << exclude_profile_ids
        matches.reject { |m| exclude_profile_ids.include?(m[:profile].id) }
      end
    end

    broadcasts = []
    JobMatcher.stub :new, ->(*args) { matcher_class.new(matches, calls) } do
      ActionCable.server.stub :broadcast, ->(channel, payload) { broadcasts << [channel, payload] } do
        assert_emails 1 do
          perform_enqueued_jobs do
            RecomputeMatchesJob.perform_later(jd.id)
            RecomputeMatchesJob.perform_later(jd.id)
          end
        end
      end
    end

    expected_cache = { profile.id => 90 }
    assert_equal expected_cache, Rails.cache.read(cache_key)
    assert_equal [["recruiter_notifications_#{recruiter.id}", { job_id: job.id, applicant_profile_id: profile.id, score: 90 }]], broadcasts
    assert_equal [[], [profile.id]], calls
  ensure
    Rails.cache = original_cache
  end
end

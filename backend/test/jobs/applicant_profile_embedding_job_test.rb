require "minitest/autorun"
ENV["RAILS_ENV"] ||= "test"
require_relative "../../config/environment"
require "rails/test_help"

class ApplicantProfileEmbeddingJobTest < ActiveJob::TestCase
  setup do
    @profile = ApplicantProfile.create!(name: "Jane Doe", email: "jane@example.com")
  end

  test "updates applicant profile embedding" do
    embedding = [0.1, 0.2, 0.3]
    client = Class.new do
      def initialize(response)
        @response = response
      end

      def embeddings(parameters:)
        @response
      end
    end.new({ "data" => [{ "embedding" => embedding }] })

    OpenAI::Client.stub :new, client do
      perform_enqueued_jobs do
        ApplicantProfileEmbeddingJob.perform_later(@profile.id, "Resume text")
      end
    end
    assert_equal embedding, @profile.reload.embedding
  end

  test "logs error when embedding generation fails" do
    error_client = Class.new do
      def embeddings(*)
        raise StandardError, "boom"
      end
    end.new

    messages = []
    Rails.logger.stub :error, ->(msg) { messages << msg } do
      OpenAI::Client.stub :new, error_client do
        perform_enqueued_jobs do
          ApplicantProfileEmbeddingJob.perform_later(@profile.id, "Resume text")
        end
      end
    end

    assert_match "Embedding error for ApplicantProfile #{@profile.id}: boom", messages.first
  end
end

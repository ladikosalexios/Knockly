require "minitest/autorun"
ENV["RAILS_ENV"] ||= "test"
require_relative "../../config/environment"
require "rails/test_help"

class ApplicantProfileEmbeddingJobTest < ActiveJob::TestCase
  setup do
    @profile = ApplicantProfile.create!(name: "Jane Doe", email: "jane@example.com")
  end

  test "updates applicant profile embedding" do
    embedding = [ 0.1, 0.2, 0.3 ]
    OPENAI_CLIENT.stub(:embeddings, ->(**) { { "data" => [ { "embedding" => embedding } ] } }) do
      perform_enqueued_jobs do
        ApplicantProfileEmbeddingJob.perform_later(@profile.id, "Resume text")
      end
    end
    assert_equal embedding, @profile.reload.embedding
  end

  test "logs error when embedding generation fails" do
    messages = []
    Rails.logger.stub :error, ->(msg) { messages << msg } do
      OPENAI_CLIENT.stub(:embeddings, ->(*) { raise StandardError, "boom" }) do
        perform_enqueued_jobs do
          ApplicantProfileEmbeddingJob.perform_later(@profile.id, "Resume text")
        end
      end
    end

    assert_match "Embedding error for ApplicantProfile #{@profile.id}: boom", messages.first
  end
end

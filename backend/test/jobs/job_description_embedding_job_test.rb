require "minitest/autorun"
ENV["RAILS_ENV"] ||= "test"
require_relative "../../config/environment"
require "rails/test_help"

class JobDescriptionEmbeddingJobTest < ActiveJob::TestCase
  setup do
    user = User.create!(email: "u@example.com", password: "password")
    company = Company.create!(name: "Co")
    job = Job.create!(status: "active", company: company, posted_by_user: user)
    @jd = JobDescription.create!(job: job, title: "T", description: "Something", location: "NYC")
  end

  test "updates job description embedding" do
    embedding = [0.1, 0.2]
    OPENAI_CLIENT.stub(:embeddings, ->(**) { { "data" => [ { "embedding" => embedding } ] } }) do
      perform_enqueued_jobs do
        JobDescriptionEmbeddingJob.perform_later(@jd.id)
      end
    end
    assert_equal embedding, @jd.reload.embedding
  end

  test "logs error when embedding generation fails" do
    messages = []
    Rails.logger.stub :error, ->(msg) { messages << msg } do
      OPENAI_CLIENT.stub(:embeddings, ->(*) { raise StandardError, "boom" }) do
        perform_enqueued_jobs do
          JobDescriptionEmbeddingJob.perform_later(@jd.id)
        end
      end
    end
    assert_match "Embedding error for JobDescription #{@jd.id}: boom", messages.first
  end
end

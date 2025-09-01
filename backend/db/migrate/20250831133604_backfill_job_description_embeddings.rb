class BackfillJobDescriptionEmbeddings < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  class JobDescription < ApplicationRecord; end

  def up
    say_with_time "Enqueue JobDescriptionEmbeddingJob for existing job descriptions" do
      JobDescription.where(embedding: nil).find_each do |jd|
        JobDescriptionEmbeddingJob.perform_later(jd.id)
      end
    end
  end

  def down
    # no-op
  end
end

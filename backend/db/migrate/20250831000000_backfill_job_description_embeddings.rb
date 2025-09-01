class BackfillJobDescriptionEmbeddings < ActiveRecord::Migration[8.0]
  def up
    JobDescription.find_each do |jd|
      text = [jd.title, jd.description, jd.requirements].compact.join("\n")
      next if text.blank?
      JobDescriptionEmbeddingJob.perform_later(jd.id, text)
    end
  end

  def down
    # no-op
  end
end

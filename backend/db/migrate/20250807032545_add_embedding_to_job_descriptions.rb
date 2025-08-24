class AddEmbeddingToJobDescriptions < ActiveRecord::Migration[8.0]
  def change
    add_column :job_descriptions, :embedding, :jsonb
  end
end

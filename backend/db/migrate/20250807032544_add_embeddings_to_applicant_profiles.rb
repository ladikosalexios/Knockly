class AddEmbeddingsToApplicantProfiles < ActiveRecord::Migration[8.0]
  def change
    add_column :applicant_profiles, :embedding, :jsonb
  end
end

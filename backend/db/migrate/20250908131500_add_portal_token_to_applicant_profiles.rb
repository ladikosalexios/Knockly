class AddPortalTokenToApplicantProfiles < ActiveRecord::Migration[7.0]
  def change
    add_column :applicant_profiles, :portal_token, :string
    add_index :applicant_profiles, :portal_token, unique: true
  end
end

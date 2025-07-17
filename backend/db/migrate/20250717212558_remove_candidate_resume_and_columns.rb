class RemoveCandidateResumeAndColumns < ActiveRecord::Migration[7.0]
  def change
    # Remove resume_skills table (if it exists)
    drop_table :resume_skills, if_exists: true

    # Remove candidate_resumes table (if it exists)
    drop_table :candidate_resumes, if_exists: true

    # Remove candidate columns from users
    remove_column :users, :user_type, :string if column_exists?(:users, :user_type)
    remove_column :users, :company_id, :integer if column_exists?(:users, :company_id)
    remove_column :users, :role, :string if column_exists?(:users, :role)
    # Change default for role and restrict possible values if you want:
    # Optionally, you can add a validation in the User model for only "admin"/"recruiter" roles

    # Remove unique index for email on candidate_resumes if not already cleaned up
    # remove_index :candidate_resumes, :email if index_exists?(:candidate_resumes, :email)
  end
end
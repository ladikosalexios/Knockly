class AddUserIdToCandidateResumes < ActiveRecord::Migration[8.0]
  def change
    add_column :candidate_resumes, :user_id, :integer
    add_index :candidate_resumes, :user_id
  end
end

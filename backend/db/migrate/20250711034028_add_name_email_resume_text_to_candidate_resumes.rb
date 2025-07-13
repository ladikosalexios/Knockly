class AddNameEmailResumeTextToCandidateResumes < ActiveRecord::Migration[8.0]
  def change
    add_column :candidate_resumes, :name, :string
    add_column :candidate_resumes, :email, :string
    add_column :candidate_resumes, :resume_text, :text
    add_index  :candidate_resumes, :email, unique: true
  end
end

class AddResumeTextToJobApplications < ActiveRecord::Migration[8.0]
  def change
    add_column :job_applications, :resume_text, :text
  end
end

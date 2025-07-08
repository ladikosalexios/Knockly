class CreateCandidateResumes < ActiveRecord::Migration[8.0]
  def change
    create_table :candidate_resumes do |t|
      t.string :job_title
      t.text :description
      t.integer :years_experience_min
      t.integer :years_experience_max

      t.timestamps
    end
  end
end

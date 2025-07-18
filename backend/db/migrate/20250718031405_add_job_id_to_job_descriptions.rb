class AddJobIdToJobDescriptions < ActiveRecord::Migration[8.0]
  def change
    add_reference :job_descriptions, :job, null: false, foreign_key: true
    # add_index :job_descriptions, :job_id, unique: true
  end
end
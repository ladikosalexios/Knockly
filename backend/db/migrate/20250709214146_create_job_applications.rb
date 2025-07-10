class CreateJobApplications < ActiveRecord::Migration[8.0]
  def change
    create_table :job_applications do |t|
      t.integer :job_id
      t.string :name
      t.string :email

      t.timestamps
    end
  end
end

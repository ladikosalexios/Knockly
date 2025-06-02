class CreateJobs < ActiveRecord::Migration[8.0]
  def change
    create_table :jobs do |t|
      t.string :title
      t.text :description
      t.string :location
      t.boolean :is_remote
      t.string :job_type
      t.string :experience_level
      t.integer :salary_min
      t.integer :salary_max
      t.string :salary_currency
      t.boolean :is_salary_visible
      t.string :status
      t.datetime :expires_at

      t.timestamps
    end
  end
end

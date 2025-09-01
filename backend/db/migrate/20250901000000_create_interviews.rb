class CreateInterviews < ActiveRecord::Migration[7.0]
  def change
    create_table :interviews do |t|
      t.references :job_application, null: false, foreign_key: true
      t.datetime :scheduled_at, null: false
      t.string :location, null: false
      t.text :notes

      t.timestamps
    end
  end
end

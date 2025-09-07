class CreateJobPostVariants < ActiveRecord::Migration[7.0]
  def change
    create_table :job_post_variants do |t|
      t.references :job, null: false, foreign_key: true
      t.text :copy
      t.boolean :active, default: false
      t.integer :view_count, default: 0, null: false
      t.integer :click_count, default: 0, null: false
      t.integer :apply_count, default: 0, null: false

      t.timestamps
    end
  end
end

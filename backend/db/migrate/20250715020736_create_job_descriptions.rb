class CreateJobDescriptions < ActiveRecord::Migration[8.0]
  def change
    create_table :job_descriptions do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.text :requirements
      t.text :benefits
      t.string :company_name
      t.string :location
      t.boolean :is_remote, default: false
      t.string :job_type
      t.string :experience_level
      t.integer :salary_min
      t.integer :salary_max
      t.string :salary_currency
      t.boolean :is_salary_visible, default: true
      t.string :external_id
      t.string :source
      t.datetime :parsed_at

      t.timestamps
    end
    add_index :job_descriptions, [ :title, :company_name, :location ], name: "index_job_desc_on_title_company_location"
    add_index :job_descriptions, :external_id
  end
end

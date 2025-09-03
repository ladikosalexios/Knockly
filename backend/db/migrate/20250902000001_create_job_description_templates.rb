class CreateJobDescriptionTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :job_description_templates do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.text :requirements
      t.string :company_name
      t.string :location
      t.boolean :is_remote, default: false
      t.string :job_type
      t.integer :years_experience_min
      t.integer :years_experience_max
      t.integer :salary_min
      t.integer :salary_max
      t.string :salary_currency
      t.boolean :is_salary_visible, default: true
      t.string :external_id
      t.string :source
      t.datetime :parsed_at
      t.jsonb :embedding
      t.timestamps
    end
    add_index :job_description_templates, [:title, :company_name, :location], name: "index_jd_templates_on_title_company_location"
    add_index :job_description_templates, :external_id
  end
end

class CreateJobDescriptionTemplateSkills < ActiveRecord::Migration[8.0]
  def change
    create_table :job_description_template_skills do |t|
      t.references :job_description_template, null: false, foreign_key: true, index: { name: 'index_jdt_skills_on_template_id' }
      t.references :skill, null: false, foreign_key: true
      t.string :importance
      t.timestamps
    end
  end
end

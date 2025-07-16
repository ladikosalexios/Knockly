class CreateJobDescriptionSkills < ActiveRecord::Migration[7.0]
  def change
    create_table :job_description_skills do |t|
      t.references :job_description, null: false, foreign_key: true
      t.references :skill, null: false, foreign_key: true
      t.string :importance
      t.timestamps
    end
  end
end

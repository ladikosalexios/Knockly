class CreateInterviewTemplates < ActiveRecord::Migration[8.0]
  def change
    create_table :interview_templates do |t|
      t.string :title, null: false
      t.jsonb :questions, default: []
      t.references :job, null: false, foreign_key: true

      t.timestamps
    end
  end
end

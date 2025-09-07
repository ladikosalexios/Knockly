class CreateScorecards < ActiveRecord::Migration[8.0]
  def change
    create_table :scorecards do |t|
      t.references :interview, null: false, foreign_key: true
      t.references :interview_template, null: false, foreign_key: true
      t.references :evaluator, null: false, foreign_key: { to_table: :users }
      t.jsonb :responses, default: {}
      t.datetime :submitted_at

      t.timestamps
    end
  end
end

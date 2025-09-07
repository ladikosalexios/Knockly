class CreateAnalyticsSnapshots < ActiveRecord::Migration[8.0]
  def change
    create_table :analytics_snapshots do |t|
      t.date :date, null: false
      t.jsonb :stage_counts, null: false, default: {}
      t.jsonb :conversion_rates, null: false, default: {}
      t.jsonb :median_stage_times, null: false, default: {}

      t.timestamps
    end

    add_index :analytics_snapshots, :date, unique: true
  end
end

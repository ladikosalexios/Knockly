ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

ActiveJob::Base.queue_adapter = :test

module ActiveSupport
  class TestCase
    # Run tests sequentially to simplify database setup
    parallelize(workers: 1)

    fixtures :all

    # Ensure missing tables used in tests exist
    if ActiveRecord::Base.connection.data_source_exists?(:interviews)
      unless ActiveRecord::Base.connection.column_exists?(:interviews, :interview_template_id)
        ActiveRecord::Schema.define do
          add_reference :interviews, :interview_template, foreign_key: true
        end
      end
    else
      ActiveRecord::Schema.define do
        create_table :interviews do |t|
          t.references :job_application, null: false, foreign_key: true
          t.datetime :scheduled_at, null: false
          t.string :location, null: false
          t.text :notes
          t.references :interview_template, foreign_key: true
          t.timestamps
        end
      end
    end

    unless ActiveRecord::Base.connection.data_source_exists?(:interview_templates)
      ActiveRecord::Schema.define do
        create_table :interview_templates do |t|
          t.string :title, null: false
          t.jsonb :questions, default: []
          t.references :job, null: false, foreign_key: true
          t.timestamps
        end
      end
    end

    unless ActiveRecord::Base.connection.data_source_exists?(:scorecards)
      ActiveRecord::Schema.define do
        create_table :scorecards do |t|
          t.references :interview, null: false, foreign_key: true
          t.references :interview_template, null: false, foreign_key: true
          t.references :evaluator, null: false
          t.jsonb :responses, default: {}
          t.timestamps
        end
      end
    end

    # Add more helper methods to be used by all tests here...
  end
end

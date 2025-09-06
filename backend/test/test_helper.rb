ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

ActiveJob::Base.queue_adapter = :test

module ActiveSupport
  class TestCase
    # Run tests sequentially to simplify database setup
    parallelize(workers: 1)

    # Ensure missing tables used in tests exist
    unless ActiveRecord::Base.connection.data_source_exists?(:interviews)
      ActiveRecord::Schema.define do
        create_table :interviews do |t|
          t.references :job_application, null: false, foreign_key: true
          t.datetime :scheduled_at, null: false
          t.string :location, null: false
          t.text :notes
          t.timestamps
        end
      end
    end

    # Add more helper methods to be used by all tests here...
  end
end

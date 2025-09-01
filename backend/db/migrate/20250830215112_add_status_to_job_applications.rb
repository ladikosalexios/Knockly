class AddStatusToJobApplications < ActiveRecord::Migration[8.0]
  def change
    add_column :job_applications, :status, :integer, default: 0, null: false unless column_exists?(:job_applications, :status)
  end
end

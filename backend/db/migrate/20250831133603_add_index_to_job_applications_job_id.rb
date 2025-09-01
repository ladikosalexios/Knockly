class AddIndexToJobApplicationsJobId < ActiveRecord::Migration[8.0]
  def change
    add_index :job_applications, :job_id
  end
end

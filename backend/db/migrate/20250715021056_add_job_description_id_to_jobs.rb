class AddJobDescriptionIdToJobs < ActiveRecord::Migration[8.0]
  def change
    add_column :jobs, :job_description_id, :integer
  end
end

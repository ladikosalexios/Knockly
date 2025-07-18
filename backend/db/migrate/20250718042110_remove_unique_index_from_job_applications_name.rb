class RemoveUniqueIndexFromJobApplicationsName < ActiveRecord::Migration[7.1]
  def change
    remove_index :job_applications, :name if index_exists?(:job_applications, :name)
  end
end
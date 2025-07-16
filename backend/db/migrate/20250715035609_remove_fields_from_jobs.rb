class RemoveFieldsFromJobs < ActiveRecord::Migration[7.0]
  def change
    remove_column :jobs, :title, :string
    remove_column :jobs, :description, :text
    remove_column :jobs, :location, :string
    remove_column :jobs, :is_remote, :boolean
    remove_column :jobs, :job_type, :string
    remove_column :jobs, :experience_level, :string
    remove_column :jobs, :salary_min, :integer
    remove_column :jobs, :salary_max, :integer
    remove_column :jobs, :salary_currency, :string
    remove_column :jobs, :is_salary_visible, :boolean
  end
end

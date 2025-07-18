class AddFieldsToJobApplications < ActiveRecord::Migration[8.0]
  def change
    add_column :job_applications, :phone, :string
    add_column :job_applications, :work_authorization, :string
    add_column :job_applications, :gender, :string
    add_column :job_applications, :ethnicity, :string
    add_column :job_applications, :disability_status, :string
    add_column :job_applications, :veteran_status, :string
  end
end

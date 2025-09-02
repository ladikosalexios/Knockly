class AddFitFeedbackToJobApplications < ActiveRecord::Migration[8.0]
  def change
    add_column :job_applications, :fit_feedback, :integer
  end
end

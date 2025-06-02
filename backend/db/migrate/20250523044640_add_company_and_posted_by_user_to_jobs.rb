class AddCompanyAndPostedByUserToJobs < ActiveRecord::Migration[8.0]
  def change
    add_reference :jobs, :company, null: false, foreign_key: true
    add_reference :jobs, :posted_by_user, null: false, foreign_key: { to_table: :users }
  end
end
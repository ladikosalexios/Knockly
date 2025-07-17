class CollapseCompanyUsers < ActiveRecord::Migration[8.0]
  def change
    # Add company_id to users unless it already exists
    add_column :users, :company_id, :bigint unless column_exists?(:users, :company_id)
    add_foreign_key :users, :companies

    # Remove the join table
    drop_table :company_users, if_exists: true
  end
end
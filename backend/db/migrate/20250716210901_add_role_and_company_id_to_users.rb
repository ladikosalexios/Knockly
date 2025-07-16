class AddRoleAndCompanyIdToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :role, :string, null: false, default: "candidate"
    add_column :users, :company_id, :integer
    add_index :users, :email, unique: true
  end
end

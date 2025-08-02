class AddIsLooplyAdminToUsers < ActiveRecord::Migration[8.0]
  def change
      add_column :users, :is_looply_admin, :boolean, default: false
  end
end

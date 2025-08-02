class AddInviteTokenToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :invite_token, :string
  end
end

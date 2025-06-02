class CreateCompanies < ActiveRecord::Migration[8.0]
  def change
    create_table :companies do |t|
      t.string :name
      t.text :description
      t.string :logo_url
      t.string :website
      t.string :industry
      t.string :company_size

      t.timestamps
    end
  end
end

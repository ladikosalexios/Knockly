class AddFieldsToJobPostVariants < ActiveRecord::Migration[7.0]
  def change
    add_column :job_post_variants, :location, :string
    add_column :job_post_variants, :is_remote, :boolean, default: false
    add_column :job_post_variants, :requirements, :text
    add_column :job_post_variants, :skills, :text
    add_column :job_post_variants, :job_type, :string
    add_column :job_post_variants, :years_experience_min, :integer
    add_column :job_post_variants, :years_experience_max, :integer
    add_column :job_post_variants, :salary_min, :integer
    add_column :job_post_variants, :salary_max, :integer
    add_column :job_post_variants, :salary_currency, :string
    add_column :job_post_variants, :expires_at, :date
  end
end

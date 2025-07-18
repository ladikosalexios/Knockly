class UpdateJobDescriptionsForExperienceAndBenefits < ActiveRecord::Migration[8.0]
  def change
    remove_column :job_descriptions, :benefits, :string
    remove_column :job_descriptions, :experience_level, :string
    add_column :job_descriptions, :years_experience_min, :integer
    add_column :job_descriptions, :years_experience_max, :integer
  end
end

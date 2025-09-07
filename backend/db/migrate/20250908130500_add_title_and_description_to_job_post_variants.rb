class AddTitleAndDescriptionToJobPostVariants < ActiveRecord::Migration[7.0]
  def change
    add_column :job_post_variants, :title, :string
    add_column :job_post_variants, :description, :text
    remove_column :job_post_variants, :copy, :text
  end
end

class DropJobSkillsTable < ActiveRecord::Migration[7.0]
  def change
    drop_table :job_skills
  end
end
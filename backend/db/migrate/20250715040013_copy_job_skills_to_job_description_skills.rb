class CopyJobSkillsToJobDescriptionSkills < ActiveRecord::Migration[7.0]
  def up
    # For every Job that has a job_description and job_skills, copy them to JobDescriptionSkill
    Job.includes(:job_description, :skills).find_each do |job|
      jd = job.job_description
      next unless jd
      job.skills.each do |skill|
        JobDescriptionSkill.find_or_create_by!(
          job_description_id: jd.id,
          skill_id: skill.id,
          importance: nil # or map job_skill.importance if you want!
        )
      end
    end
  end

  def down
    # Optional: delete copied records
    JobDescriptionSkill.delete_all
  end
end

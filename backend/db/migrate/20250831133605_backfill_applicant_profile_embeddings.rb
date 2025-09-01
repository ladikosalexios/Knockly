class BackfillApplicantProfileEmbeddings < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  class ApplicantProfile < ApplicationRecord
    self.table_name = 'applicant_profiles'
  end

  class JobApplication < ApplicationRecord
    self.table_name = 'job_applications'
  end

  def up
    say_with_time "Enqueue ApplicantProfileEmbeddingJob for existing applicant profiles" do
      ApplicantProfile.where(embedding: nil).find_each do |profile|
        resume_text = JobApplication.where(applicant_profile_id: profile.id)
                                     .where.not(resume_text: nil)
                                     .order(created_at: :desc)
                                     .limit(1)
                                     .pluck(:resume_text)
                                     .first
        next if resume_text.blank?
        ApplicantProfileEmbeddingJob.perform_later(profile.id, resume_text)
      end
    end
  end

  def down
    # no-op
  end
end

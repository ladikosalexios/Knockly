module Api
  module Admin
    class DashboardController < ApplicationController
      before_action :require_company!

      # GET /api/admin/dashboard
      def index
        jobs = Job
          .includes(:job_applications, job_description: :skills)
          .where(company_id: current_user.company_id)
          .order(created_at: :desc)

        render json: jobs.map { |job|
          jd = job.job_description
          {
            id: job.id,
            status: job.status,
            expires_at: job.expires_at,
            created_at: job.created_at,
            title: jd&.title || "(Untitled)",
            location: jd&.location,
            is_remote: jd&.is_remote,
            job_type: jd&.job_type,
            years_experience_min: jd&.years_experience_min,
            years_experience_max: jd&.years_experience_max,
            salary_min: jd&.salary_min,
            salary_max: jd&.salary_max,
            salary_currency: jd&.salary_currency,
            applicants_count: job.job_applications.size,
            skills: jd&.skills&.map(&:name) || [],
            description: jd&.description || "",
            requirements: jd&.requirements || "",
            variant_count: job.job_post_variants.count
          }
        }
      end

      private

      def require_company!
        unless current_user&.company_id.present?
          render json: { error: "Unauthorized" }, status: :unauthorized
        end
      end
    end
  end
end

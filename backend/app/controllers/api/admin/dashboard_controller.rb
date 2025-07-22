module Api
  module Admin
    class DashboardController < ApplicationController
      before_action :require_company!

      # GET /api/admin/dashboard
      def index
        jobs = Job
          .includes(:job_description, :job_applications)
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
            applicants_count: job.job_applications.size,
            skills: jd&.skills&.pluck(:name) || [],
            description: jd&.description || [],
            requirements: jd&.requirements || []

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
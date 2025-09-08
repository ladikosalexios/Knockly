class JobApplicationMailer < ApplicationMailer
  def application_received(job_application)
    @job_application = job_application
    @portal_url = portal_url
    mail to: @job_application.email, subject: "We've received your application"
  end

  def status_changed(job_application)
    @job_application = job_application
    @portal_url = portal_url
    mail to: @job_application.email, subject: "Your application status has been updated"
  end

  private

  def portal_url
    token = @job_application.applicant_profile.portal_token
    base = ENV.fetch('FRONTEND_URL', 'http://localhost:5173')
    "#{base}/candidate-portal?token=#{token}"
  end
end

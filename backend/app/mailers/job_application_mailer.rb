class JobApplicationMailer < ApplicationMailer
  def status_changed(job_application)
    @job_application = job_application
    mail to: @job_application.email, subject: "Your application status has been updated"
  end
end

class RecruiterMailer < ApplicationMailer
  def new_high_score_match(recruiter, job, profile, score)
    @job = job
    @profile = profile
    @score = score
    mail(to: recruiter.email, subject: "New high-score match") do |format|
      format.text { render plain: "Applicant #{@profile.name} scored #{@score} for job #{@job.id}." }
    end
  end
end

class InterviewMailer < ApplicationMailer
  def calendar_invite(interview)
    @interview = interview
    recruiter_email = interview.job_application.job.posted_by_user.email
    applicant_email = interview.job_application.email
    token = interview.job_application.applicant_profile.portal_token
    @portal_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:5173')}/candidate-portal?token=#{token}"

    attachments['interview.ics'] = {
      mime_type: 'text/calendar; charset=UTF-8; method=REQUEST',
      content: generate_ics(interview)
    }

    mail(to: [applicant_email, recruiter_email], subject: 'Interview Scheduled') do |format|
      format.text { render plain: "Interview details attached.\nAccess your portal: #{@portal_url}" }
    end
  end

  private

  def generate_ics(interview)
    start_time = interview.scheduled_at.utc.strftime('%Y%m%dT%H%M%SZ')
    end_time = (interview.scheduled_at + 1.hour).utc.strftime('%Y%m%dT%H%M%SZ')
    title = interview.job_application.job.job_description&.title || 'Interview'
    <<~ICS
    BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//Knockly//EN
    BEGIN:VEVENT
    UID:interview-#{interview.id}@knockly
    DTSTAMP:#{Time.now.utc.strftime('%Y%m%dT%H%M%SZ')}
    DTSTART:#{start_time}
    DTEND:#{end_time}
    SUMMARY:Interview for #{title}
    DESCRIPTION:#{interview.notes}
    LOCATION:#{interview.location}
    END:VEVENT
    END:VCALENDAR
    ICS
  end
end

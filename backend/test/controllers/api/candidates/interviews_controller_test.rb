require 'test_helper'

class Api::Candidates::InterviewsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @company = Company.create!(name: 'Co')
    @user = User.create!(email: 'u@example.com', password: 'password', company: @company)
    @job = Job.create!(status: 'active', company: @company, posted_by_user: @user)
    JobDescription.create!(job: @job, title: 'T', description: 'D', location: 'NYC')
    @profile = ApplicantProfile.create!(name: 'A', email: 'a@example.com')
    @application = JobApplication.create!(job: @job, applicant_profile: @profile, name: 'A', email: 'a@example.com', phone: '123', work_authorization: 'citizen')
    @interview = Interview.create!(job_application: @application, scheduled_at: 1.day.from_now, location: 'Zoom')
  end

  test 'requires candidate session' do
    get '/api/candidates/interviews'
    assert_response :unauthorized
  end

  test 'returns interviews for logged in candidate' do
    post '/api/candidate_session', params: { token: @profile.portal_token }
    get '/api/candidates/interviews'
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 1, body.length
    assert_equal @interview.id, body[0]['id']
  end
end

require 'test_helper'

class Api::CandidateSessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @profile = ApplicantProfile.create!(name: 'A', email: 'a@example.com')
  end

  test 'creates session with valid token' do
    post '/api/candidate_session', params: { token: @profile.portal_token }
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal @profile.id, body['id']
  end

  test 'rejects invalid token' do
    post '/api/candidate_session', params: { token: 'bad' }
    assert_response :unauthorized
  end
end

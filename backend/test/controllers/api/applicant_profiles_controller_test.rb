require "test_helper"

class Api::ApplicantProfilesControllerTest < ActionDispatch::IntegrationTest
  test "returns profiles with similarity" do
    profile = ApplicantProfile.create!(name: "Jane", email: "jane@example.com", embedding: [1.0, 0.0])
    skill = Skill.create!(name: "ruby")
    ApplicantProfileSkill.create!(applicant_profile: profile, skill: skill)

    EmbeddingService.stub(:generate, [1.0, 0.0]) do
      get api_applicant_profiles_url(q: "ruby")
      assert_response :success
      body = JSON.parse(@response.body)
      assert_equal 1, body.length
      assert_in_delta 1.0, body.first["similarity"], 1e-6
      assert_equal ["ruby"], body.first["skills"]
    end
  end
end

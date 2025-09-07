require "test_helper"

class Api::JobsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include Warden::Test::Helpers

  setup do
    @user = User.create!(email: "u@e.com", password: "password")
    @company = Company.create!(name: "Co")
    @user.update!(company: @company)
    sign_in @user, scope: :user
    @job = Job.create!(status: "active", company: @company, posted_by_user: @user)
  end

  teardown do
    Warden.test_reset!
  end

  test "lists variants" do
    @job.job_post_variants.create!(copy: "A")
    get "/api/jobs/#{@job.id}/variants"
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 1, body.length
    assert_equal "A", body.first["copy"]
  end

  test "creates variant" do
    post "/api/jobs/#{@job.id}/variants", params: { variant: { copy: "B" } }
    assert_response :created
    assert_equal 1, @job.job_post_variants.count
  end

  test "activates variant" do
    v1 = @job.job_post_variants.create!(copy: "A")
    v2 = @job.job_post_variants.create!(copy: "B")
    post "/api/jobs/#{@job.id}/variants/#{v2.id}/activate"
    assert_response :success
    assert v2.reload.active
    refute v1.reload.active
  end

  test "tracks view event" do
    v = @job.job_post_variants.create!(copy: "A")
    post "/api/jobs/#{@job.id}/variants/#{v.id}/track", params: { event: "view" }
    assert_response :success
    assert_equal 1, v.reload.view_count
  end

  test "requires auth for variants" do
    sign_out @user
    get "/api/jobs/#{@job.id}/variants"
    assert_response :unauthorized
  end
end

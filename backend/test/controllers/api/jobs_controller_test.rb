require "test_helper"

class Api::JobsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include Warden::Test::Helpers

  setup do
    @user = User.create!(email: "u@e.com", password: "password")
    @admin = User.create!(email: "a@e.com", password: "password", is_looply_admin: true)
    @company = Company.create!(name: "Co")
    [@user, @admin].each { |u| u.update!(company: @company) }
    @job = Job.create!(status: "active", company: @company, posted_by_user: @user)
  end

  teardown do
    Warden.test_reset!
  end

  test "lists variants" do
    sign_in @admin, scope: :user
    @job.job_post_variants.create!(title: "A", description: "Desc")
    get "/api/jobs/#{@job.id}/variants"
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal 1, body.length
    assert_equal "A", body.first["title"]
  end

  test "creates variant" do
    sign_in @admin, scope: :user
    post "/api/jobs/#{@job.id}/variants", params: {
      variant: {
        title: "B",
        description: "Desc",
        location: "NYC",
        is_remote: true
      }
    }
    assert_response :created
    variant = @job.job_post_variants.first
    assert_equal "NYC", variant.location
    assert variant.is_remote
  end

  test "activates variant" do
    sign_in @admin, scope: :user
    v1 = @job.job_post_variants.create!(title: "A", description: "Desc")
    v2 = @job.job_post_variants.create!(title: "B", description: "Desc")
    post "/api/jobs/#{@job.id}/variants/#{v2.id}/activate"
    assert_response :success
    assert v2.reload.active
    refute v1.reload.active
  end

  test "tracks view event without auth" do
    v = @job.job_post_variants.create!(title: "A", description: "Desc")
    post "/api/jobs/#{@job.id}/variants/#{v.id}/track", params: { event: "view" }
    assert_response :success
    assert_equal 1, v.reload.view_count
  end

  test "non-admin cannot manage variants" do
    sign_in @user, scope: :user
    get "/api/jobs/#{@job.id}/variants"
    assert_response :forbidden
    post "/api/jobs/#{@job.id}/variants", params: { variant: { title: "X", description: "D" } }
    assert_response :forbidden
  end
end

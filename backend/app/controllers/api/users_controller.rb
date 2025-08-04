class Api::UsersController < ApplicationController
  # Only authenticated users (i.e., admins) can send invites
  before_action :authenticate_user!, only: [:invite]

  # POST /api/invite_user
  # Allows an authenticated user to invite another user to their company
  def invite
    email = params[:email]
    password = params[:password] || SecureRandom.hex(8)
    company_id = current_user.company_id

    token = SecureRandom.uuid

    user = User.new(
      email: email,
      password: password,
      company_id: company_id,
      invite_token: token
    )

    if user.save
      invite_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:5173')}/accept-invite/#{token}?mode=join_company"
      render json: { message: "User invited successfully.", invite_url: invite_url }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  rescue => e
    render json: { error: "Unexpected error: #{e.message}" }, status: :internal_server_error
  end

  # GET /api/accept_invite/:token
  # Retrieves user info when the invite link is opened
    def accept_invite
        user = User.find_by(invite_token: params[:token])

        if user
            render json: {
            email: user.email,
            company_name: user.company&.name,
            company_id: user.company_id
            }, status: :ok
        else
            render json: { error: "Invalid invite token" }, status: :not_found
        end
    end

#   def generate_invite
#     email = params.dig(:user, :email) || params[:email]

#     # Validate presence of required email
#     if email.blank?
#       render json: { error: 'Email is required.' }, status: :bad_request
#       return
#     end

#     domain = email.split('@').last
#     existing_user = User.where("email LIKE ?", "%@#{domain}").exists?

#     mode = existing_user ? "join_company" : "new_company"

#     user = User.new(email: email, password: SecureRandom.hex(10))
#     user.invite_token = SecureRandom.hex(20)

#     if user.save
#       invite_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:5173')}/accept-invite/#{user.invite_token}?mode=#{mode}"
#       render json: { message: 'Invite created successfully.', invite_url: invite_url }, status: :created
#     else
#       render json: { error: user.errors.full_messages }, status: :unprocessable_entity
#     end
#   end

  def generate_invite
    email = params.dig(:user, :email) || params[:email]

    if email.blank?
        render json: { error: 'Email is required.' }, status: :bad_request
        return
    end

    domain = email.split('@').last
    existing_user = User.where("email LIKE ?", "%@#{domain}").where.not(company_id: nil).first

    mode = existing_user ? "join_company" : "new_company"
    company_id = existing_user&.company_id

    user = User.new(email: email, password: SecureRandom.hex(10))
    user.invite_token = SecureRandom.hex(20)
    user.company_id = company_id if mode == "join_company"

    if user.save
        invite_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:5173')}/accept-invite/#{user.invite_token}?mode=#{mode}"
        render json: { message: 'Invite created successfully.', invite_url: invite_url }, status: :created
    else
        render json: { error: user.errors.full_messages }, status: :unprocessable_entity
    end
end

  # POST /api/finalize_invite
  def finalize_invite
  user = User.find_by(invite_token: params[:token])

  if user && params[:password].present?
    user.password = params[:password]
    user.invite_token = nil
    user.save!

    sign_in(user) # <- ✅ AUTHENTICATE the user right after accepting

    render json: { message: "Invite accepted. You are now logged in." }
  else
    render json: { error: "Invalid token or password missing." }, status: :bad_request
  end
end

  # GET /api/users/me
  def me
    if current_user
      render json: {
        id: current_user.id,
        email: current_user.email,
        company_id: current_user.company_id,
        is_looply_admin: current_user.is_looply_admin,
        invite_token: current_user.invite_token
      }, status: :ok
    else
      render json: { error: "Not authenticated" }, status: :unauthorized
    end
  end

end

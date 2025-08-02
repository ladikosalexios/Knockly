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
      invite_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:5173')}/accept-invite/#{token}"
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

    if user && user.company
      render json: {
        email: user.email,
        company_name: user.company.name,
        company_id: user.company.id
      }, status: :ok
    else
      render json: { error: "Invalid invite token" }, status: :not_found
    end
  rescue => e
    render json: { error: "Unexpected error: #{e.message}" }, status: :internal_server_error
  end

    def generate_invite
        email = params[:email]
        company_id = params[:company_id]

        # Validate presence of required parameters
        if email.blank? || company_id.blank?
            render json: { error: 'Email and company_id are required.' }, status: :bad_request
            return
        end

        # Create a new user with a random password (they'll set their own later)
        user = User.new(email: email, password: SecureRandom.hex(10), company_id: company_id)
        user.invite_token = SecureRandom.hex(20)

        if user.save
            # Generate a frontend-friendly invite link using the invite token
            invite_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:5173')}/accept-invite/#{user.invite_token}"
            
            # Return success response with the invite URL
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
        render json: { message: "Invite accepted. You can now log in." }
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

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]

  def create
    build_resource(sign_up_params)

    company = Company.create!(name: params[:user][:company_name])
    resource.company = company

    resource.save
    yield resource if block_given?
    if resource.persisted?
      if resource.active_for_authentication?
        sign_up(resource_name, resource)
        render json: { message: 'Signed up successfully.' }, status: :ok
      else
        expire_data_after_sign_in!
        render json: { message: 'Signed up but inactive.' }, status: :ok
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:company_name])
  end
end
# class ApplicationController < ActionController::API
#   def current_user
#     @current_user ||= User.find_by(api_key: request.headers["Authorization"])
#   end
# end
class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session, if: -> { request.format.json? }
  before_action :authenticate_user!        # <-- optional, depending on routes
end
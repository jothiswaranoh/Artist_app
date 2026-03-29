module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :authorize_request
  end

  def authorize_request
    # Use user already attached by middleware if available
    @current_user = request.env['current_user']
    return if @current_user

    header = request.headers['Authorization']
    token = header&.split(' ')&.last
    return render_error(message: 'Missing token', status: :unauthorized) unless token

    begin
      @decoded = ::JsonWebToken.decode(token)
      @current_user = User.find(@decoded[:user_id])
    rescue ActiveRecord::RecordNotFound => e
      render_error(message: 'User not found', status: :unauthorized, errors: [e.message])
    rescue ::JWT::DecodeError => e
      render_error(message: 'Invalid token', status: :unauthorized, errors: [e.message])
    rescue ::JWT::ExpiredSignature => e
      render_error(message: 'Token expired', status: :unauthorized, errors: [e.message])
    end
  end

  def current_user
    @current_user
  end
end

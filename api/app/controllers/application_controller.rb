class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ResponseRenderingConcern
  include Authentication
  include Authorization
  include Paginatable
  include Sortable

  rescue_from ActiveRecord::RecordNotFound do |e|
    render_error(message: 'Resource not found', status: :not_found, errors: [e.message])
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render_error(message: 'Validation failed', status: :unprocessable_entity, errors: e.record.errors.full_messages)
  end

  rescue_from ArgumentError do |e|
    render_error(message: 'Invalid argument', status: :bad_request, errors: [e.message])
  end

  rescue_from StandardError do |e|
    # Log the error for debugging
    Rails.logger.error "[StandardError] #{e.class}: #{e.message}\n#{e.backtrace.first(5).join("\n")}"
    render_error(message: 'Internal server error', status: :internal_server_error, errors: [e.message])
  end

  def authorize_admin
    return if current_user&.admin?

    render_error(message: "Unauthorized access", status: :forbidden)
  end

  def authorize_artist
    return if current_user&.approved_artist?

    render_error(message: "Access denied", status: :forbidden)
  end
end

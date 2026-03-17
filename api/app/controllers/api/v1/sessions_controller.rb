module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authorize_request, only: :create

      # POST /api/v1/login
      def create
        @user = User.find_by_email(params[:email])

        unless @user&.authenticate(params[:password])
          return render_error(message: "Invalid credentials", status: :unauthorized)
        end

        unless @user.status == "active"
          return render_error(message: "Account is not active", status: :forbidden)
        end

        access_token = JsonWebToken.encode(user_id: @user.id, role: @user.role)
        _, refresh_token_raw = RefreshToken.issue_for(@user)

        render_success(
          data: {
            access_token:  access_token,
            refresh_token: refresh_token_raw,
            expires_in:    JsonWebToken::ACCESS_TOKEN_TTL.to_i,
            token_type:    "Bearer",
            user: {
              id:    @user.id,
              email: @user.email,
              role:  @user.role
            }
          },
          message: "Login successful"
        )
      end

      # DELETE /api/v1/logout
      #
      # Revokes *all* refresh tokens for the current user (full sign-out).
      # The short-lived access token will expire naturally; add a JTI blacklist
      # table to invalidate it immediately if needed.
      def destroy
        current_user.refresh_tokens.active.update_all(revoked_at: Time.current)

        render_success(message: "Logged out successfully")
      end

      # GET /api/v1/me
      def me
        render_success(
          data:    UserSerializer.new(current_user),
          message: "Current user retrieved successfully"
        )
      end

      private

      def login_params
        params.permit(:email, :password)
      end
    end
  end
end

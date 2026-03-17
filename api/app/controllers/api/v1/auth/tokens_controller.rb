module Api
  module V1
    module Auth
      # POST /api/v1/auth/refresh
      #
      # Issues a new access token (and rotated refresh token) in exchange for a
      # valid, non-expired, non-revoked refresh token.
      #
      # Request body (JSON):
      #   { "refresh_token": "<opaque_refresh_token>" }
      #
      # Success response (200):
      #   {
      #     "success": true,
      #     "message": "Token refreshed successfully",
      #     "data": {
      #       "access_token":  "<new_jwt>",
      #       "refresh_token": "<new_opaque_token>",   ← rotated
      #       "expires_in":    900,                    ← seconds
      #       "token_type":    "Bearer"
      #     }
      #   }
      #
      # Error responses:
      #   400 – refresh_token field missing
      #   401 – invalid / expired / replayed token
      #   403 – user account suspended / inactive
      class TokensController < ApplicationController
        # This endpoint authenticates *via* the refresh token — no Bearer header needed.
        skip_before_action :authorize_request, only: :refresh

        # POST /api/v1/auth/refresh
        def refresh
          result = ::Auth::TokenRefreshService.call(raw_token: refresh_params[:refresh_token])

          if result.success?
            render_success(
              data:    result.tokens,
              message: "Token refreshed successfully"
            )
          else
            render_error(
              message: result.error,
              status:  result.http_status
            )
          end
        end

        private

        def refresh_params
          params.permit(:refresh_token)
        end
      end
    end
  end
end

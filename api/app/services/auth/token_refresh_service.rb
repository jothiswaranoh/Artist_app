module Auth
  # Auth::TokenRefreshService
  #
  # Encapsulates all business logic for the token-refresh flow:
  #   1. Validate the raw refresh token exists and is active
  #   2. Detect replay attacks (token already revoked → revoke whole family)
  #   3. Rotate: revoke the consumed token, issue a fresh pair
  #   4. Return a structured result object
  #
  # Usage:
  #   result = Auth::TokenRefreshService.call(raw_token: params[:refresh_token])
  #   if result.success?
  #     render_success(data: result.tokens, ...)
  #   else
  #     render_error(message: result.error, status: result.http_status)
  #   end
  class TokenRefreshService
    Result = Struct.new(:success?, :tokens, :error, :http_status, keyword_init: true)

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------
    def self.call(raw_token:)
      new(raw_token).call
    end

    def initialize(raw_token)
      @raw_token = raw_token
    end

    def call
      # Guard: token must be present in the request
      return failure("Refresh token is required", :bad_request) if @raw_token.blank?

      record = RefreshToken.find_by_raw(@raw_token)

      # Guard: token must exist in the DB — unknown token = invalid
      return failure("Invalid refresh token", :unauthorized) if record.nil?

      # Guard: detect replay attack — token was already consumed or revoked
      if record.revoked?
        # A revoked token being replayed indicates a potential theft.
        # Revoke the entire family so the legitimate holder must re-login.
        RefreshToken.revoke_family!(record.family_id)
        Rails.logger.warn(
          "[Auth::TokenRefreshService] REPLAY DETECTED — family #{record.family_id} " \
          "for user #{record.user_id} has been revoked entirely."
        )
        return failure("Refresh token has already been used. Please log in again.", :unauthorized)
      end

      # Guard: token must not be expired (DB-level check, belt-and-suspenders)
      return failure("Refresh token has expired. Please log in again.", :unauthorized) if record.expired?

      user = record.user

      # Guard: user must still exist and be active
      return failure("Account is not active.", :forbidden) unless user.status == "active"

      # ------------------------------------------------------------------
      # Rotation — all writes wrapped in a transaction for atomicity:
      #   • revoke the consumed token
      #   • issue a new access token + new refresh token (same family)
      # ------------------------------------------------------------------
      new_access_token, new_refresh_token_raw = nil
      ActiveRecord::Base.transaction do
        record.revoke!   # soft-revoke the consumed token

        new_access_token = JsonWebToken.encode(user_id: user.id, role: user.role)

        _, new_refresh_token_raw = RefreshToken.issue_for(user, family_id: record.family_id)
      end

      Rails.logger.info("[Auth::TokenRefreshService] Rotated refresh token for user #{user.id}")

      success(
        access_token:  new_access_token,
        refresh_token: new_refresh_token_raw,
        expires_in:    JsonWebToken::ACCESS_TOKEN_TTL.to_i,
        token_type:    "Bearer"
      )
    end

    # ------------------------------------------------------------------
    private
    # ------------------------------------------------------------------

    def success(tokens_hash)
      Result.new(success?: true, tokens: tokens_hash, error: nil, http_status: :ok)
    end

    def failure(message, status)
      Result.new(success?: false, tokens: nil, error: message, http_status: status)
    end
  end
end

require "jwt"

# JsonWebToken — thin wrapper around the jwt gem.
#
# Access tokens are short-lived (15 min) signed JWTs.
# They carry a `jti` (JWT ID) so issued access-token JTIs can be tracked
# alongside their paired refresh tokens for rotation purposes.
#
# Refresh tokens are *not* JWTs — they are opaque random strings stored in the DB.
module JsonWebToken
  SECRET_KEY = Rails.application.secret_key_base

  ACCESS_TOKEN_TTL  = 15.minutes    # short-lived: limits exposure if leaked
  ALGORITHM         = "HS256"       # HMAC-SHA256 — symmetric, fast, sufficient here

  # ------------------------------------------------------------------
  # Encode a new signed access token.
  # @param payload [Hash]  – { user_id: ..., role: ... }
  # @param exp     [Time]  – override expiry (for tests)
  # @return [String] signed JWT
  # ------------------------------------------------------------------
  def self.encode(payload, exp = ACCESS_TOKEN_TTL.from_now)
    payload = payload.dup
    payload[:exp] = exp.to_i
    payload[:iat] = Time.now.to_i        # issued-at (for audit / future blacklist)
    payload[:jti] = SecureRandom.uuid    # unique token ID (rotation anchor)
    JWT.encode(payload, SECRET_KEY, ALGORITHM)
  end

  # ------------------------------------------------------------------
  # Decode and verify a JWT access token.
  #
  # Raises typed sub-classes of JWT::DecodeError so callers can
  # render the correct HTTP status code without string-matching messages.
  #
  # Possible raised errors (all children of JWT::DecodeError):
  #   JWT::ExpiredSignature   – token has expired
  #   JWT::ImmatureSignature  – token used before iat
  #   JWT::DecodeError        – bad signature or malformed token
  # ------------------------------------------------------------------
  def self.decode(token)
    raise JWT::DecodeError, "Token missing" if token.blank?

    decoded, = JWT.decode(
      token,
      SECRET_KEY,
      true,
      {
        algorithm:        ALGORITHM,
        verify_expiration: true,
        verify_iat:        true,
      }
    )
    HashWithIndifferentAccess.new(decoded)
  end

  # ------------------------------------------------------------------
  # Decode WITHOUT expiry verification.
  # Useful to read the `user_id` from an expired token (for logging etc.)
  # without raising, but we must NOT trust this result for auth.
  # ------------------------------------------------------------------
  def self.decode_unverified(token)
    decoded, = JWT.decode(token, nil, false)
    HashWithIndifferentAccess.new(decoded)
  rescue StandardError
    {}
  end
end

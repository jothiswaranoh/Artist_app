require "jwt"

module JsonWebToken
  SECRET_KEY = Rails.application.secret_key_base

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    payload = HashWithIndifferentAccess.new(decoded)

    if payload[:exp].present? && Time.at(payload[:exp]) < Time.current
      raise JWT::ExpiredSignature, 'Token has expired'
    end

    payload
  end
end

class RefreshToken < ApplicationRecord
  belongs_to :user

  validates :token_digest, :jti, :family_id, :expires_at, presence: true
  validates :token_digest, uniqueness: true
  validates :jti,          uniqueness: true

  scope :active,   -> { where(revoked_at: nil).where("expires_at > ?", Time.current) }
  scope :expired,  -> { where("expires_at <= ?", Time.current) }
  scope :revoked,  -> { where.not(revoked_at: nil) }

  # ------------------------------------------------------------------
  # Class helpers
  # ------------------------------------------------------------------

  # Creates a new RefreshToken record for the given user.
  # Returns [record, raw_token] so the raw value can be sent to the client once.
  def self.issue_for(user, family_id: SecureRandom.uuid)
    raw      = SecureRandom.urlsafe_base64(48)           # 384 bits of entropy
    digest   = digest_token(raw)
    jti      = SecureRandom.uuid
    record   = create!(
      user:          user,
      token_digest:  digest,
      jti:           jti,
      family_id:     family_id,
      expires_at:    RefreshToken.ttl.from_now
    )
    [record, raw]
  end

  # Looks up a RefreshToken by its raw token string (via SHA-256 digest).
  def self.find_by_raw(raw)
    find_by(token_digest: digest_token(raw))
  end

  # SHA-256 hex digest — fast and collision-resistant.
  def self.digest_token(raw)
    Digest::SHA256.hexdigest(raw.to_s)
  end

  # Configurable TTL; default 30 days.
  def self.ttl
    (ENV.fetch("REFRESH_TOKEN_TTL_DAYS") { 30 }).to_i.days
  end

  # Revoke all tokens belonging to the same family (replay-attack response).
  def self.revoke_family!(family_id)
    where(family_id: family_id).update_all(revoked_at: Time.current)
  end

  # Hard-delete expired rows to keep the table lean (run via a scheduled job).
  def self.purge_expired!
    expired.delete_all
  end

  # ------------------------------------------------------------------
  # Instance helpers
  # ------------------------------------------------------------------

  def active?
    revoked_at.nil? && expires_at > Time.current
  end

  def expired?
    expires_at <= Time.current
  end

  def revoked?
    revoked_at.present?
  end

  # Soft-revoke this specific token (called during rotation after issuing the new one).
  def revoke!
    update!(revoked_at: Time.current)
  end
end

class CreateRefreshTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :refresh_tokens, id: :uuid do |t|
      t.references :user,      null: false, foreign_key: true, type: :uuid
      # SHA-256 hex digest of the raw opaque token — we never store the plaintext
      t.string     :token_digest, null: false
      # JWT ID of the *access token* that was issued alongside this refresh token;
      # used for rotation: old access JTIs become invalid once the token is rotated
      t.string     :jti,          null: false
      # Hard expiry stored in the DB so we can prune expired rows easily
      t.datetime   :expires_at,   null: false
      # Soft-revoke: set when the token is consumed (rotation) or explicitly revoked
      t.datetime   :revoked_at
      # Family ID groups tokens issued from the same login session.
      # If a token in the family is used twice (replay), the entire family is revoked.
      t.string     :family_id,    null: false

      t.timestamps
    end

    add_index :refresh_tokens, :token_digest, unique: true
    add_index :refresh_tokens, :jti,          unique: true
    add_index :refresh_tokens, :family_id
    add_index :refresh_tokens, [:user_id, :revoked_at]
  end
end

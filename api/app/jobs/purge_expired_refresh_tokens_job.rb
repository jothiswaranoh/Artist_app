class PurgeExpiredRefreshTokensJob < ApplicationJob
  queue_as :default

  # Scheduled periodically (e.g., daily via Sidekiq-Cron / GoodJob).
  # Removes expired refresh token rows so the table doesn't grow unbounded.
  def perform
    purged = RefreshToken.purge_expired!
    Rails.logger.info("[PurgeExpiredRefreshTokensJob] Removed #{purged} expired refresh tokens")
  end
end

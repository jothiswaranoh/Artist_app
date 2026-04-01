module Dashboard
  class AdminStatsService < BaseStatsService
    def call
      booking_stats = aggregate_booking_stats(Booking.all)
      user_stats = User.group(:status).count

      {
        total_users: user_stats.values.sum,
        active_users: user_stats['active'] || 0,
        total_artists: ArtistProfile.count,
        approved_artists: ArtistProfile.where(is_approved: true).count,
        total_bookings: booking_stats[:total_bookings].to_i,
        pending_bookings: booking_stats[:pending_bookings].to_i,
        confirmed_bookings: booking_stats[:confirmed_bookings].to_i,
        completed_bookings: booking_stats[:completed_bookings].to_i,
        total_services: Service.count,
        total_reviews: Review.count,
        total_revenue: Payment.sum(:amount).to_f,
        total_payments: Payment.sum(:amount).to_f, # alias for frontend compatibility
        total_organizations: (ActiveRecord::Base.connection.table_exists?('organizations') ? Organization.count : 0)
      }
    end
  end
end

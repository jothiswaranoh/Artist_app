module Dashboard
  class ArtistStatsService < BaseStatsService
    def call
      profile = user.artist_profile
      return {} unless profile

      bookings_query = Booking.where(artist_profile_id: profile.id)
      stats = aggregate_booking_stats(
        bookings_query,
        upcoming_bookings_count: ['booking_date >= ? AND status IN (?)', Date.today, %w[pending confirmed]]
      )

      reviews = Review.where(artist_profile_id: profile.id)
      services = Service.where(artist_profile_id: profile.id)

      {
        total_bookings: stats[:total_bookings] || 0,
        pending_bookings: stats[:pending_bookings] || 0,
        completed_bookings: stats[:completed_bookings] || 0,
        upcoming_bookings_count: stats[:upcoming_bookings_count] || 0,
        total_services: services.count,
        total_reviews: reviews.count,
        average_rating: reviews.average(:rating)&.round(1) || 0,
        total_revenue: sum_revenue(bookings_query),
        recent_bookings: ActiveModelSerializers::SerializableResource.new(
          bookings_query.includes(:service, :customer, :artist_profile, :payment)
                        .reorder(created_at: :desc)
                        .limit(5),
          each_serializer: BookingSerializer
        )
      }
    end
  end
end

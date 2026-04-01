module Dashboard
  class CustomerStatsService < BaseStatsService
    def call
      return {} unless user

      bookings_query = Booking.where(customer_id: user.id)
      stats = aggregate_booking_stats(bookings_query)
      reviews = Review.where(customer_id: user.id)

      {
        total_bookings: stats[:total_bookings].to_i,
        pending_bookings: stats[:pending_bookings].to_i,
        completed_bookings: stats[:completed_bookings].to_i,
        total_spent: sum_revenue(bookings_query),
        total_payments: sum_revenue(bookings_query),
        total_reviews: reviews.count
      }
    end
  end
end

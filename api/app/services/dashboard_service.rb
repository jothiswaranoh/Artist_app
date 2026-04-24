class DashboardService
  def initialize(user)
    @user = user
  end

  def stats
    if @user.admin?
      admin_stats
    elsif @user.approved_artist?
      artist_stats
    else
      customer_stats
    end
  end

  def admin_dashboard
    admin_stats
  end

  def artist_dashboard
    raise ActiveRecord::RecordNotFound, "Artist profile not found" unless @user.artist_profile

    artist_stats
  end

  private

  def admin_stats
    {
      total_users: User.count,
      active_users: User.where(status: "active").count,
      total_artists: ArtistProfile.count,
      approved_artists: ArtistProfile.where(is_approved: true).count,
      total_bookings: Booking.count,
      pending_bookings: Booking.where(status: "pending").count,
      confirmed_bookings: Booking.where(status: "confirmed").count,
      completed_bookings: Booking.where(status: "completed").count,
      total_services: Service.count,
      total_reviews: Review.count,
      total_revenue: Payment.sum(:amount),
      total_organizations: Organization.count
    }
  end

  def artist_stats
    profile = @user.artist_profile

    bookings = Booking.where(artist_profile_id: profile.id)
    services = Service.where(artist_profile_id: profile.id)
    reviews  = Review.where(artist_profile_id: profile.id)

    {
      total_bookings: bookings.count,
      pending_bookings: bookings.where(status: "pending").count,
      completed_bookings: bookings.where(status: "completed").count,
      total_services: services.count,
      total_reviews: reviews.count,
      average_rating: reviews.average(:rating)&.round(1) || 0,
      total_revenue: Payment.joins(:booking)
                            .where(bookings: { artist_profile_id: profile.id })
                            .sum(:amount),
      upcoming_bookings: bookings
                          .where(status: ["pending", "confirmed"])
                          .where("booking_date >= ?", Date.today)
                          .count
    }
  end

  def customer_stats
    bookings = Booking.where(customer_id: @user.id)
    reviews  = Review.where(customer_id: @user.id)

    {
      total_bookings: bookings.count,
      pending_bookings: bookings.where(status: "pending").count,
      completed_bookings: bookings.where(status: "completed").count,
      total_spent: Payment.joins(:booking)
                          .where(bookings: { customer_id: @user.id })
                          .sum(:amount),
      total_reviews: reviews.count
    }
  end
end
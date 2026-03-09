class ArtistProfileSerializer < ActiveModel::Serializer
  attributes :id,
             :name,
             :email,
             :city,
             :bio,
             :experience_years,
             :base_price,
             :is_approved,
             :services_count,
             :bookings_count,
             :reviews_count,
             :created_at

  def name
    object.user&.name # change if you have name column
  end

  def email
    object.user&.email
  end

  def services_count
    object.services.count
  end

  def bookings_count
    object.bookings.count
  end

  def reviews_count
    object.reviews.count
  end
end

class TopArtistSerializer < ActiveModel::Serializer
  attributes :id, :name, :city, :base_price, :bookings_count, :email

  def name
    object.name.presence || object.user&.name || object.user&.email
  end

  def email
    object.user&.email
  end

  def bookings_count
    object.attributes['bookings_count'].to_i
  end

  def base_price
    object.base_price.to_f
  end
end

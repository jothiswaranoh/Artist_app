class Booking < ApplicationRecord
  belongs_to :service
  belongs_to :artist_profile
  belongs_to :customer, class_name: "User", foreign_key: :customer_id

  has_one :payment, dependent: :destroy
  has_one :review, dependent: :destroy

  STATUSES = %w[pending confirmed completed cancelled].freeze
  validates :status, inclusion: { in: STATUSES }, allow_nil: true

  scope :upcoming, -> { where('booking_date >= ?', Date.current).where(status: ['pending', 'confirmed']) }
  scope :for_customer, ->(customer_id) { where(customer_id: customer_id) }
  scope :for_artist, ->(artist_profile_id) { where(artist_profile_id: artist_profile_id) }
  scope :recent_first, -> { order(booking_date: :desc, created_at: :desc) }
end

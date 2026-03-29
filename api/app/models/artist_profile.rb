class ArtistProfile < ApplicationRecord
  belongs_to :user

  has_many :services, dependent: :destroy
  has_many :availabilities, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :reviews, dependent: :destroy

  validates :city, :name, presence: true, allow_blank: false
  validates :base_price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  scope :approved, -> { where(is_approved: true) }
  scope :recent_first, -> { order(created_at: :desc) }
end

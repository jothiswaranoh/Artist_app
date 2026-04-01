module Api
  module V1
    module Admin
      class DashboardController < ApplicationController
        before_action :authorize_admin

        # GET /api/v1/admin/dashboard
        def index
          stats = Dashboard::AdminStatsService.new(current_user).call

          render_success(
            data: stats,
            message: "Admin dashboard stats retrieved successfully"
          )
        end

        # GET /api/v1/admin/recent-bookings
        def recent_bookings
          scope = Booking
                    .includes(:service, :customer, :artist_profile, :payment)
                    .reorder(created_at: :desc)

          bookings = paginate(scope)

          render_paginated_success(
            bookings,
            serialized_data: ActiveModelSerializers::SerializableResource.new(
              bookings,
              each_serializer: BookingSerializer
            ),
            message: "Recent bookings retrieved successfully"
          )
        end

        # GET /api/v1/admin/top-artists
        def top_artists
          limit = params.fetch(:limit, 5).to_i.clamp(1, 50)

          artists = ArtistProfile
                      .joins(:bookings)
                      .where(bookings: { status: 'completed' })
                      .group('artist_profiles.id')
                      .select('artist_profiles.*, COUNT(bookings.id) AS bookings_count')
                      .includes(:user)
                      .order('bookings_count DESC')
                      .limit(limit)

          render_success(
            data: ActiveModelSerializers::SerializableResource.new(
              artists,
              each_serializer: TopArtistSerializer
            ),
            message: "Top artists retrieved successfully"
          )
        end

        # GET /api/v1/admin/revenue-chart
        def revenue_chart
          revenue_data =
            Payment
              .group("DATE_TRUNC('month', created_at)")
              .order("DATE_TRUNC('month', created_at)")
              .sum(:amount)
              .map do |date, total|
                {
                  month: date.strftime('%b %Y'),
                  revenue: total.to_f
                }
              end

          render_success(
            data: revenue_data,
            message: "Revenue chart data retrieved successfully"
          )
        end

        # GET /api/v1/admin/bookings-by-status
        def bookings_by_status
          counts = Booking.group(:status).count
          
          # Ensure all statuses are included, even with 0 count
          formatted_counts = Booking::STATUSES.map do |status|
            {
              status: status,
              count: counts[status] || 0
            }
          end

          render_success(
            data: formatted_counts,
            message: "Bookings by status retrieved successfully"
          )
        end

        # GET /api/v1/admin/activity-feed
        def activity_feed
          users = User.order(created_at: :desc)
                      .limit(5)
                      .select(:id, :name, :email, :created_at)

          bookings = Booking
                       .includes(:customer, :service)
                       .order(created_at: :desc)
                       .limit(5)

          approvals = ArtistProfile
                        .includes(:user)
                        .where.not(approved_at: nil)
                        .order(approved_at: :desc)
                        .limit(5)
                        .select(:id, :name, :approved_at, :user_id)

          feed = []

          users.each do |user|
            feed << {
              id: user.id,
              type: 'signup',
              message: "New user joined: #{user.name || user.email}",
              timestamp: user.created_at
            }
          end

          bookings.each do |booking|
            feed << {
              id: booking.id,
              type: 'booking',
              message: "New booking for #{booking.service&.name} by #{booking.customer&.name || booking.customer&.email || 'a customer'}",
              timestamp: booking.created_at
            }
          end

          approvals.each do |profile|
            feed << {
              id: profile.id,
              type: 'approval',
              message: "Artist approved: #{profile.name || profile.user&.email}",
              timestamp: profile.approved_at
            }
          end

          feed = feed.sort_by { |item| item[:timestamp] }.reverse.first(15)

          render_success(
            data: feed,
            message: "Activity feed retrieved successfully"
          )
        end

        private

        def authorize_admin
          return if current_user&.role == 'admin'

          render_error(message: "Unauthorized access", status: :forbidden)
          false
        end
      end
    end
  end
end

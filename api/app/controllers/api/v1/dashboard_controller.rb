module Api
  module V1
    class DashboardController < ApplicationController
      before_action :authorize_artist, only: [:artist]
      before_action :authorize_admin, only: [:admin]
      # GET /api/v1/dashboard  (legacy — returns stats based on role)
      def index
        stats = DashboardService.new(current_user).stats
        render_success(
          data: { stats: stats },
          message: "Dashboard data retrieved successfully"
        )
      end

      # GET /api/v1/dashboard/admin
      def admin
        stats = DashboardService.new(current_user).admin_dashboard
        render_success(
          data: { stats: stats },
          message: "Admin dashboard retrieved successfully"
        )
      end

      # GET /api/v1/dashboard/artist
      def artist
        stats = DashboardService.new(current_user).artist_dashboard
        render_success(
          data: { stats: stats },
          message: "Artist dashboard retrieved successfully"
        )
      end

    end
  end
end

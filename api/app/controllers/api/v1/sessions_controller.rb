module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authorize_request, only: :create

      # POST /api/v1/login
      def create
        @user = User.find_by_email(login_params[:email])
        if @user&.authenticate(login_params[:password])
          return render_error(message: "Account is not active", status: :forbidden) unless @user.status == "active"

          access_token  = JsonWebToken.encode({ user_id: @user.id, type: "access" }, 1.hour.from_now)
          refresh_token = JsonWebToken.encode({ user_id: @user.id, type: "refresh" }, 7.days.from_now)
      
          render_success(
            data: { 
              token: access_token, 
              refresh_token: refresh_token,
             exp: (Time.now + 1.hour).strftime("%m-%d-%Y %H:%M"),
              id: @user.id,
              name: @user.name,
              email: @user.email,
              role: @user.role
            }, 
            message: 'Login successful'
          )
        else
          render_error(message: 'Invalid credentials', status: :unauthorized)
        end
      end

      # DELETE /api/v1/logout
      def destroy
        # With JWT there is no server-side session to destroy.
        # The client simply discards the token.
        # If you later add a token blacklist table, invalidate the token here.
        render_success(message: 'Logged out successfully')
      end

      # GET /api/v1/me
      def me
        render_success(
          data: current_user.slice(:id, :name, :email, :role),
          message: 'Current user retrieved successfully'
        )
      end


      # PATCH /api/v1/profile
      def update_profile
        if current_user.update(profile_params)
          render_success(
            data: current_user.slice(:id, :name, :email, :role),
            message: "Profile updated successfully"
          )
        else
          render_error(
            message: current_user.errors.full_messages,
            status: :unprocessable_entity
          )
        end
      end


      # DELETE /api/v1/profile
      def delete_profile
        user = current_user
        ActiveRecord::Base.transaction do
          # cancel bookings created by the user
          Booking.where(customer_id: user.id, status: "pending")
                 .update_all(status: "cancelled")
 
          # cancel bookings received by the artist
          if user.artist? && user.artist_profile
            Booking.where(artist_profile_id: user.artist_profile.id, status: "pending")
                   .update_all(status: "cancelled")
          end

        user.update!(status: "inactive")
        end
        render_success(
          message: "Account deleted successfully"
        )
      end

      def refresh
        token = request.headers['Authorization']&.split(' ')&.last

        return render_error(message: "Refresh token missing", status: :unauthorized) unless token

        begin
          decoded = JsonWebToken.decode(token)
          return render_error(message: "Invalid token type", status: :unauthorized) unless decoded[:type] == "refresh"

          user = User.find(decoded[:user_id])
          return render_error(message: "Account is not active", status: :forbidden) unless user.status == "active"
          
          new_access_token = JsonWebToken.encode({ user_id: user.id, type: "access"  }, 1.hour.from_now)

          render_success(
            data: { token: new_access_token },
            message: "Token refreshed successfully"
          )
        rescue JWT::DecodeError, ActiveRecord::RecordNotFound
          render_error(message: "Invalid or expired refresh token", status: :unauthorized)
        end
      end
        
      private

      def profile_params
        params.permit(
          :name,
          :phone,
          :address,
          :preferences,
          :password,
          :password_confirmation
        )
      end

      def login_params
        params.permit(:email, :password)
      end
    end
  end
end

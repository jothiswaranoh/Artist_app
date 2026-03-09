module Api
  module V1
    class SessionsController < ApplicationController
      skip_before_action :authorize_request, only: :create

      # POST /api/v1/login
      def create
        @user = User.find_by_email(login_params[:email])
        if @user&.authenticate(login_params[:password])
          token = ::JsonWebToken.encode(user_id: @user.id)
          time = Time.now + 24.hours.to_i
          render_success(
            data: { 
              token: token, 
              exp: time.strftime("%m-%d-%Y %H:%M"),
              id: @user.id,
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
          data: current_user,
          message: 'Current user retrieved successfully'
        )
      end


      # PATCH /api/v1/profile
      def update_profile
        if current_user.update(profile_params)
          render_success(
            data: current_user,
            message: "Profile updated successfully"
          )
        else
          render_error(
            message: current_user.errors.full_messages,
            status: :unprocessable_entity
          )
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

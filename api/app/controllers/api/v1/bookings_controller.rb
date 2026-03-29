module Api
  module V1
    class BookingsController < ApplicationController
      include Crudable
      load_and_authorize_resource except: [:create]

      def create
        @resource = Booking.new(resource_params)

        # Auto-assign customer_id if current user is a customer
        if current_user.customer?
          @resource.customer_id = current_user.id
        end

        # Auto-assign artist_profile_id from the service if missing
        if @resource.artist_profile_id.blank? && @resource.service_id.present?
          service = Service.find_by(id: @resource.service_id)
          @resource.artist_profile_id = service.artist_profile_id if service
        end

        # Default status
        @resource.status ||= 'pending'

        authorize! :create, @resource

        if @resource.save
          render_success(
            data: BookingSerializer.new(@resource),
            status: :created
          )
        else
          render_error(errors: @resource.errors.full_messages)
        end
      end

      def index
        @bookings = paginate(collection)
        render_paginated_success(
          @bookings,
          serialized_data: ActiveModelSerializers::SerializableResource.new(
            @bookings,
            each_serializer: BookingSerializer
          ),
          message: "Bookings retrieved successfully"
        )
      end

      # GET /api/v1/bookings/my_bookings
      # Returns bookings where the current user is the customer
      def my_bookings
        bookings = paginate(
          Booking
            .for_customer(current_user.id)
            .includes(:service, :artist_profile, :payment, :customer)
            .reorder(booking_date: :desc, created_at: :desc)
        )

        render_paginated_success(
          bookings,
          serialized_data: ActiveModelSerializers::SerializableResource.new(
            bookings,
            each_serializer: BookingSerializer
          ),
          message: "Your bookings retrieved successfully"
        )
      end

      # GET /api/v1/bookings/artist_bookings
      # Returns bookings assigned to the current user's artist profile
      def artist_bookings
        profile = current_user.artist_profile
        unless profile
          return render_error(message: "Artist profile not found", status: :not_found)
        end

        bookings = Booking.where(artist_profile_id: profile.id).order(booking_date: :desc)
        bookings = paginate(bookings)
        render_paginated_success(
          bookings,
          serialized_data: ActiveModelSerializers::SerializableResource.new(
            bookings,
            each_serializer: BookingSerializer
          ),
          message: "Artist bookings retrieved successfully"
        )
      end

      def destroy
        # load_and_authorize_resource sets @booking and handles authorization
        # Just need to destroy it and respond
        authorize! :destroy, @booking
        @booking.destroy
        render_success(message: 'Booking deleted successfully')
      end
      private

      def booking_params
        params.require(:booking).permit(:artist_profile_id, :service_id, :booking_date, :start_time, :end_time, :total_amount, :status)
      end

      def resource_params
        booking_params
      end

      def collection
        base = Booking.includes(:service, :artist_profile, :payment, :customer)

        scoped =
          if current_user.role == 'admin'
            base
          elsif current_user.role == 'artist'
            base.where(artist_profile_id: current_user.artist_profile&.id)
          else
            base.where(customer_id: current_user.id)
          end

        scoped.reorder(booking_date: :desc, created_at: :desc)
      end
    end
  end
end

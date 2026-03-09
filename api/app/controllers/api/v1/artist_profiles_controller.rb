module Api
  module V1
    class ArtistProfilesController < ApplicationController
      include Crudable
      load_and_authorize_resource

      def index
        authorize! :read, ArtistProfile
        profiles = paginate(collection)
        render_paginated_success(profiles, message: 'Artist profiles retrieved successfully')
      end

      def show
         authorize! :read, ArtistProfile

         artist = ArtistProfile
             .includes(:user, :services, :reviews)
             .find_by(id: params[:id])

         return render_error(message: "Artist not found", status: :not_found) unless artist

         render json: {
         success: true,
         message: "Artist details retrieved successfully",
         data: ActiveModelSerializers::SerializableResource.new(
          artist,
          serializer: ArtistDetailSerializer
         )
        }
      end

      private

      def artist_profile_params
        params.require(:artist_profile).permit(:name, :bio, :experience_years, :base_price, :city)
      end

      def resource_params
        artist_profile_params
      end

      def collection
        ArtistProfile
        .includes(:user, :services, :bookings, :reviews)
        .order(created_at: :desc)
      end
    end
  end
end


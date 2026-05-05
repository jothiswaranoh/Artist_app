import { apiService } from './api';
import type { ArtistDetail, AvailabilitySlot } from '../types/artist.types';

export interface ArtistProfile {
    id: string;
    user_id: string;

    name: string | null;
    email: string;

    bio: string | null;
    base_price: number | string;
    city: string | null;
    experience_years: number;
    is_approved?: boolean;
    services_count?: number;
    bookings_count?: number;
    reviews_count?: number;
    created_at: string;
    updated_at: string;
    services?: any[];
    bookings?: any[];
    reviews?: any[];
}

export const ArtistProfileService = {
  // ArtistProfileService.ts
  getArtistDetail: async (id: string): Promise<ArtistDetail> => {
    const response = await apiService.get<ArtistDetail>(`/artists/${id}`);
    // response.data is ArtistDetail based on your ApiResponse<T> wrapper
    if (!response.data) throw new Error("Artist not found");
    return response.data;
  },

  getArtistAvailability: async (id: string): Promise<AvailabilitySlot[]> => {
    const response = await apiService.get<AvailabilitySlot[]>(
      `/artists/${id}/availability`,
    );
    // data may be null if no availability set — safe fallback to []
    return response.data ?? [];
  },
  getAll: async (page?: number, perPage?: number, search?: string) => {
    const response = await apiService.get("/artist_profiles", {
      page,
      per_page: perPage,
      search,
    });

    return response;
  },
  getById: async (id: string) => {
    const response = await apiService.get(`/artist_profiles/${id}`);
    return response.data;
  },
  create: async (data: Partial<ArtistProfile>) => {
    const response = await apiService.post("/artist_profiles", {
      artist_profile: data,
    });
    return response.data;
  },
  update: async (id: string, data: Partial<ArtistProfile>) => {
    const response = await apiService.patch(`/artist_profiles/${id}`, {
      artist_profile: data,
    });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiService.delete(`/artist_profiles/${id}`);
    return response.data;
  },
};

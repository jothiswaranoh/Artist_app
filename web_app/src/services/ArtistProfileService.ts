import { apiService } from './api';

export interface ArtistProfile {
    id: string;
    user_id: string;
    name: string;
    bio: string;
    base_price: number;
    city: string;
    experience_years: number;
    is_approved?: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        email: string;
        role: string;
        name?: string;
        phone?: string;
        address?: string;
        preferences?: string;
        loyalty_status?: string;
    };
    services?: any[];
    bookings?: any[];
    reviews?: any[];
}

interface ArtistProfilesPayload {
    artist_profiles?: ArtistProfile[];
}

export const ArtistProfileService = {
    getAll: async (): Promise<ArtistProfile[]> => {
        const response = await apiService.get<ArtistProfilesPayload | ArtistProfile[]>('/artist_profiles');
        const payload = response.data;

        if (Array.isArray(payload)) return payload;
        return payload?.artist_profiles ?? [];
    },
    getById: async (id: string): Promise<ArtistProfile> => {
        const response = await apiService.get<ArtistProfile>(`/artist_profiles/${id}`);
        return response.data as ArtistProfile;
    },
    create: async (data: Partial<ArtistProfile>): Promise<ArtistProfile> => {
        const response = await apiService.post<ArtistProfile>('/artist_profiles', { artist_profile: data });
        return response.data as ArtistProfile;
    },
    update: async (id: string, data: Partial<ArtistProfile>): Promise<ArtistProfile> => {
        const response = await apiService.patch<ArtistProfile>(`/artist_profiles/${id}`, { artist_profile: data });
        return response.data as ArtistProfile;
    },
    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/artist_profiles/${id}`);
    }
};

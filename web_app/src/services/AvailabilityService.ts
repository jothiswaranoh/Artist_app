import { apiService } from './api';

export interface Availability {
    id: string;
    artist_profile_id: string;
    available_date: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
    created_at: string;
    updated_at: string;
}

interface AvailabilitiesPayload {
    availabilities?: Availability[];
}

export const AvailabilityService = {
    getAll: async (): Promise<Availability[]> => {
        const response = await apiService.get<AvailabilitiesPayload | Availability[]>('/availabilities');
        const payload = response.data;

        if (Array.isArray(payload)) return payload;
        return payload?.availabilities ?? [];
    },
    getById: async (id: string): Promise<Availability> => {
        const response = await apiService.get<Availability>(`/availabilities/${id}`);
        return response.data as Availability;
    },
    create: async (data: Partial<Availability>): Promise<Availability> => {
        const response = await apiService.post<Availability>('/availabilities', { availability: data });
        return response.data as Availability;
    },
    update: async (id: string, data: Partial<Availability>): Promise<Availability> => {
        const response = await apiService.patch<Availability>(`/availabilities/${id}`, { availability: data });
        return response.data as Availability;
    },
    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/availabilities/${id}`);
    }
};

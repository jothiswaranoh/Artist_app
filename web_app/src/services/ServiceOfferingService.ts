import { apiService } from './api';

export interface ServiceOffering {
    id: string;
    artist_profile_id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    created_at: string;
    updated_at: string;
}

interface ServiceOfferingsPayload {
    services?: ServiceOffering[];
}

export const ServiceOfferingService = {
    getAll: async (): Promise<ServiceOffering[]> => {
        const response = await apiService.get<ServiceOfferingsPayload | ServiceOffering[]>('/services');
        const payload = response.data;

        if (Array.isArray(payload)) return payload;
        return payload?.services ?? [];
    },
    getById: async (id: string): Promise<ServiceOffering> => {
        const response = await apiService.get<ServiceOffering>(`/services/${id}`);
        return response.data as ServiceOffering;
    },
    create: async (data: Partial<ServiceOffering>): Promise<ServiceOffering> => {
        const response = await apiService.post<ServiceOffering>('/services', { service: data });
        return response.data as ServiceOffering;
    },
    update: async (id: string, data: Partial<ServiceOffering>): Promise<ServiceOffering> => {
        const response = await apiService.patch<ServiceOffering>(`/services/${id}`, { service: data });
        return response.data as ServiceOffering;
    },
    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/services/${id}`);
    }
};

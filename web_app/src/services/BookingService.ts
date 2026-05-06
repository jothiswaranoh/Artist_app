import { apiService } from './api';

export interface Booking {
    id: string;
    artist_profile_id: string;
    customer_id: string;
    service_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    stripe_payment_intent_id?: string | null;
    total_amount: number;
    created_at: string;
    updated_at: string;

    service?: {
        id: string;
        name: string;
        price: number;
        duration_minutes: number;
    };

    customer?: {
        id: string;
        name: string | null;
        email: string;
    };

    artist?: {
        id: string;
        name: string | null;
        email: string;
    };
}

export interface CreateBookingPayload {
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
}

export const BookingService = {
  getAll: async (page: number = 1, perPage: number = 10) => {
    const response = await apiService.get("/bookings", {
      page,
      per_page: perPage,
    });
    return response;
  },
  
  getStats: async () => {
    const response = await apiService.get("/bookings/stats");
    return response;
  },
  getById: async (id: string) => {
    const response = await apiService.get(`/bookings/${id}`);
    return response.data;
  },
  create: async (data: CreateBookingPayload) => {
    const response = await apiService.post("/bookings", { booking: data });
    return response.data;
  },
  update: async (id: string, data: Partial<Booking>) => {
    const response = await apiService.patch(`/bookings/${id}`, {
      booking: data,
    });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiService.delete(`/bookings/${id}`);
    return response.data;
  },
};

import { apiService } from './api';

export interface Payment {
    id: string;
    booking_id: string;
    amount: number;
    currency: string;
    payment_status: string;
    stripe_payment_intent_id?: string | null;
    created_at: string;
    updated_at: string;
}

interface PaymentsPayload {
    payments?: Payment[];
}

export const PaymentService = {
    getAll: async (): Promise<Payment[]> => {
        const response = await apiService.get<PaymentsPayload | Payment[]>('/payments');
        const payload = response.data;

        if (Array.isArray(payload)) return payload;
        return payload?.payments ?? [];
    },
    getById: async (id: string): Promise<Payment> => {
        const response = await apiService.get<Payment>(`/payments/${id}`);
        return response.data as Payment;
    },
    create: async (data: Partial<Payment>): Promise<Payment> => {
        const response = await apiService.post<Payment>('/payments', { payment: data });
        return response.data as Payment;
    },
    update: async (id: string, data: Partial<Payment>): Promise<Payment> => {
        const response = await apiService.patch<Payment>(`/payments/${id}`, { payment: data });
        return response.data as Payment;
    },
    delete: async (id: string): Promise<void> => {
        await apiService.delete(`/payments/${id}`);
    }
};

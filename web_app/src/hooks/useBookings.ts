import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingService, type Booking } from "../services/BookingService";
import { useToast } from "../components/common/Toast";

export const useBookings = (page: number) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookings", page],
    queryFn: async () => {
      const res = await BookingService.getAll(page, 10);
      return res;
    },
    placeholderData: (prev) => prev,
  });

  const bookings = data?.data || [];
  const meta = data?.meta || {};

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  
  const createMutation = useMutation({
    mutationFn: (data: Partial<Booking>) => BookingService.create(data),
    onSuccess: () => {
      invalidate();
      showToast("Booking created successfully", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to create booking", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Booking> }) =>
      BookingService.update(id, data),
    onSuccess: () => {
      invalidate();
      showToast("Booking updated successfully", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to update booking", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BookingService.delete(id),
    onSuccess: () => {
      invalidate();
      showToast("Booking deleted successfully", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to delete booking", "error");
    },
  });

  return {
    bookings,
    meta,
    isLoading,
    error,
    createBooking: createMutation.mutate,
    updateBooking: updateMutation.mutate,
    deleteBooking: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

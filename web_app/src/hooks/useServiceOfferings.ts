import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceOfferingService, type ServiceOffering } from '../services/ServiceOfferingService';
import { useToast } from '../components/common/Toast';

export const useServiceOfferings = (page: number, perPage: number) => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const { data, isLoading, error, refetch } = useQuery({
      queryKey: ["services", page, perPage],
      queryFn: async () => {
        const res: any = await ServiceOfferingService.getAll(page, perPage);
        return {
          data: res.data || [],
          meta: res.meta || {},
        };
      },
    });

    const serviceOfferings = data?.data || [];
    const meta = data?.meta || {};

    const createMutation = useMutation({
        mutationFn: (data: Partial<ServiceOffering>) => ServiceOfferingService.create(data),
        onSuccess: () => {
            console.log("🔥 SERVICE CREATED - INVALIDATING");
            queryClient.invalidateQueries({
              queryKey: ["services"],
              exact: false,
            });
            showToast('Service created successfully', 'success');
        },
        onError: (err: any) => {
            showToast(err.message || 'Failed to create service', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ServiceOffering> }) =>
            ServiceOfferingService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            showToast('Service updated successfully', 'success');
        },
        onError: (err: any) => {
            showToast(err.message || 'Failed to update service', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ServiceOfferingService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            showToast('Service deleted successfully', 'success');
        },
        onError: (err: any) => {
            showToast(err.message || 'Failed to delete service', 'error');
        }
    });

    return {
        serviceOfferings,
        meta,
        isLoading,
        error,
        refetch,
        createServiceOffering: createMutation.mutate,
        updateServiceOffering: updateMutation.mutate,
        deleteServiceOffering: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};

import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useResource<T>(url: string) {
    const {
        data,
        isLoading: loading,
        error: queryError,
        refetch,
    } = useQuery<T>({
        queryKey: ['resource', url],
        queryFn: async () => {
            const response = await apiService.get<T>(url);
            return (response.data as T) ?? (null as unknown as T);
        },
        staleTime: 30_000,
    });

    const error = queryError ? (queryError instanceof Error ? queryError.message : String(queryError)) : null;

    return { data: data ?? null, loading, error, reload: refetch };
}

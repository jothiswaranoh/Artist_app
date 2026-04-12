import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useResource<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(url);
            if (response.success) {
                setData(response.data);
            } else {
                setError(response.message || 'Failed to fetch data');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, reload: fetchData };
}

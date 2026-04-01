import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArtistProfileService, type ArtistProfile } from '../services/ArtistProfileService';
import { useToast } from '../components/common/Toast';

export const useArtistProfiles = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const {
        data: artistProfiles = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['artist_profiles'],
        queryFn: () => ArtistProfileService.getAll(),
        staleTime: 30_000,
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<ArtistProfile>) => ArtistProfileService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artist_profiles'] });
            showToast('Artist profile created successfully', 'success');
        },
        onError: (err: Error & { message?: string }) => {
            showToast(err.message || 'Failed to create artist profile', 'error');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ArtistProfile> }) =>
            ArtistProfileService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artist_profiles'] });
            showToast('Artist profile updated successfully', 'success');
        },
        onError: (err: Error & { message?: string }) => {
            showToast(err.message || 'Failed to update artist profile', 'error');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ArtistProfileService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['artist_profiles'] });
            showToast('Artist profile deleted successfully', 'success');
        },
        onError: (err: Error & { message?: string }) => {
            showToast(err.message || 'Failed to delete artist profile', 'error');
        }
    });

    return {
        artistProfiles,
        isLoading,
        error,
        refetch,
        createArtistProfile: createMutation.mutateAsync,
        updateArtistProfile: updateMutation.mutateAsync,
        deleteArtistProfile: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};

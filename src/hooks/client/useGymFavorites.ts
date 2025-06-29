import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type GymFavorites = Tables<'gym_favorites_client'>;

export const useGymFavorites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gym-favorites', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('gym_favorites_client')
        .select(`
          *,
          gym:gyms(
            id, name, address, city, rating, featured_image,
            review_count, description
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useAddGymFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gymId, notes }: { gymId: string; notes?: string }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gym_favorites_client')
        .insert({
          client_id: user.id,
          gym_id: gymId,
          notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-favorites'] });
      toast.success('Gym added to favorites');
    },
    onError: (error: any) => {
      toast.error('Failed to add gym to favorites: ' + error.message);
    }
  });
};

export const useRemoveGymFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (favoriteId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('gym_favorites_client')
        .delete()
        .eq('id', favoriteId)
        .eq('client_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-favorites'] });
      toast.success('Gym removed from favorites');
    },
    onError: (error: any) => {
      toast.error('Failed to remove gym from favorites: ' + error.message);
    }
  });
};

export const useUpdateGymFavoriteNotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ favoriteId, notes }: { favoriteId: string; notes: string }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gym_favorites_client')
        .update({ notes })
        .eq('id', favoriteId)
        .eq('client_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-favorites'] });
      toast.success('Notes updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update notes: ' + error.message);
    }
  });
}; 

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trainer_favorites')
        .insert({
          user_id: user.id,
          trainer_id: trainerId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-favorites'] });
    }
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('trainer_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('trainer_id', trainerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-favorites'] });
    }
  });
};

export const useUserFavorites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-favorites', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('trainer_favorites')
        .select(`
          *,
          trainer:trainers!trainer_favorites_trainer_id_fkey(
            id,
            name,
            location,
            image_url,
            pricing,
            specialties,
            rating,
            users!trainers_user_id_fkey(full_name, email)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useIsFavorite = (trainerId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-favorite', trainerId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('trainer_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('trainer_id', trainerId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!trainerId
  });
};

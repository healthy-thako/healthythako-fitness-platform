
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
        .from('favorites')
        .insert({
          client_id: user.id,
          trainer_id: trainerId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
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
        .from('favorites')
        .delete()
        .eq('client_id', user.id)
        .eq('trainer_id', trainerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });
};

export const useUserFavorites = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          trainer:profiles!trainer_id(
            id,
            name,
            location
          ),
          trainer_profile:trainer_profiles!trainer_id(
            rate_per_hour,
            specializations,
            profile_image
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

export const useIsFavorite = (trainerId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-favorite', trainerId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('client_id', user.id)
        .eq('trainer_id', trainerId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!trainerId
  });
};

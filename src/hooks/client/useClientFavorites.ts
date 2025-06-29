
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useClientFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['client-favorites', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          trainer:profiles!favorites_trainer_id_fkey(
            *,
            trainer_profile:trainer_profiles!trainer_profiles_user_id_fkey(*)
          )
        `)
        .eq('client_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('client-favorites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-favorites'] });
          queryClient.invalidateQueries({ queryKey: ['client-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      if (!user) throw new Error('No user');
      
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
      queryClient.invalidateQueries({ queryKey: ['client-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      if (!user) throw new Error('No user');
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('client_id', user.id)
        .eq('trainer_id', trainerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useClientBookings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['client-bookings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Use the new get_user_trainer_bookings function for better performance
      const { data, error } = await supabase.rpc('get_user_trainer_bookings', {
        p_user_id: user.id,
        p_status: null, // Get all statuses
        p_limit: 50,
        p_offset: 0
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('client-bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
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

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
};

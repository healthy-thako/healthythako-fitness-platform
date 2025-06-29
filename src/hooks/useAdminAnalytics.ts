
import { useQuery } from '@tanstack/react-query';
import { supabase, getAdminHeaders } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useAdminAnalytics = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for analytics data
  useEffect(() => {
    const channel = supabase
      .channel('admin-analytics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      console.log('Fetching admin analytics via Edge Function...');
      
      try {
        // Use admin-analytics Edge Function for proper authentication
        const { data, error } = await supabase.functions.invoke('admin-analytics', {
          headers: getAdminHeaders()
        });
        
        if (error) {
          console.error('Error fetching admin analytics:', error);
          throw error;
        }

        if (!data || data.error) {
          throw new Error(data?.error || 'Failed to fetch analytics');
        }
        
        console.log('Admin analytics fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('Analytics fetch error:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
    staleTime: 1000 * 60 * 5 // Consider data stale after 5 minutes
  });
};
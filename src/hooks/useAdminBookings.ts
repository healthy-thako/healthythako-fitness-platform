import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getAdminHeaders } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAdminBookings = (filters?: { status?: string; trainer_id?: string; client_id?: string; search?: string }) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_bookings'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: async () => {
      console.log('Fetching admin bookings with filters:', filters);
      
      // Use admin-users Edge Function for proper authentication
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'getBookings',
          filters: filters
        },
        headers: getAdminHeaders()
      });
      
      if (error) {
        console.error('Error fetching admin bookings:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to fetch bookings');
      }
      
      console.log('Admin bookings fetched successfully:', data?.length);
      return data;
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1000 * 60 * 5 // Consider data stale after 5 minutes
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status, adminNotes }: { 
      bookingId: string; 
      status: string;
      adminNotes?: string;
    }) => {
      console.log('Updating booking status:', bookingId, status);
      
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'updateBooking',
          bookingId,
          updates: {
        status, 
            updated_at: new Date().toISOString(),
            ...(adminNotes && { notes: adminNotes })
          }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to update booking');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      console.log('Deleting booking:', bookingId);
      
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'deleteBooking',
          bookingId
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error deleting booking:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to delete booking');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

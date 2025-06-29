
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useTrainerBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-bookings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Use the new get_user_trainer_bookings function or direct query
      const { data, error } = await supabase
        .from('trainer_bookings')
        .select(`
          *,
          users!trainer_bookings_user_id_fkey(full_name, email, phone_number)
        `)
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      status, 
      notes 
    }: { 
      bookingId: string; 
      status: string; 
      notes?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');
      
      const updateData: any = { status };
      if (notes) updateData.notes = notes;

      const { data, error } = await supabase
        .from('trainer_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .eq('trainer_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats'] });
      toast.success('Booking status updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update booking: ' + error.message);
    }
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bookingData: {
      trainer_id: string;
      title?: string;
      description?: string;
      scheduled_date: string;
      scheduled_time: string;
      mode?: 'online' | 'home' | 'gym';
      session_count?: number;
      package_type?: string;
      amount: number;
    }) => {
      if (!user) throw new Error('No user authenticated');

      // Use the new book_trainer_session function for better integration
      const { data, error } = await supabase.rpc('book_trainer_session', {
        p_user_id: user.id,
        p_trainer_id: bookingData.trainer_id,
        p_session_date: bookingData.scheduled_date,
        p_session_time: bookingData.scheduled_time,
        p_duration_minutes: 60, // Default duration
        p_total_amount: bookingData.amount
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      toast.success('Booking request sent successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create booking: ' + error.message);
    }
  });
};

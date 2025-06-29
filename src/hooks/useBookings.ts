
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreateBookingData {
  trainer_id: string;
  title: string;
  description?: string;
  package_type: 'basic' | 'standard' | 'premium';
  session_count: number;
  session_duration: number;
  mode: 'online' | 'in-person' | 'home';
  amount: number;
  scheduled_date?: string;
  scheduled_time?: string;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingData) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating booking with data:', bookingData);
      
      // Use the new book_trainer_session function for better integration
      const { data, error } = await supabase.rpc('book_trainer_session', {
        p_user_id: user.id,
        p_trainer_id: bookingData.trainer_id,
        p_session_date: bookingData.scheduled_date || new Date().toISOString().split('T')[0],
        p_session_time: bookingData.scheduled_time || '10:00',
        p_duration_minutes: bookingData.session_duration || 60,
        p_total_amount: bookingData.amount
      });

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};

// Add the missing useBookings export - UPDATED for new schema
export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('trainer_bookings')
        .select(`
          *,
          trainer:trainers!trainer_bookings_trainer_id_fkey(name, contact_email),
          client:users!trainer_bookings_user_id_fkey(full_name, email)
        `)
        .or(`user_id.eq.${user.id},trainer_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useUserBookings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trainer:profiles!trainer_id(name, email),
          client:profiles!client_id(name, email)
        `)
        .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bookingId, status, notes }: { 
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
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
};

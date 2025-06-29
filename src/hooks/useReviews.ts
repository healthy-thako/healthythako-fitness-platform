
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreateReviewData {
  booking_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
}

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          reviewer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-stats'] });
    }
  });
};

export const useReviews = (revieweeId?: string) => {
  return useQuery({
    queryKey: ['reviews', revieweeId],
    queryFn: async () => {
      let query = supabase
        .from('trainer_reviews')
        .select(`
          *,
          reviewer:users!trainer_reviews_user_id_fkey(full_name),
          trainer:trainers!trainer_reviews_trainer_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (revieweeId) {
        query = query.eq('trainer_id', revieweeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!revieweeId
  });
};

export const useBookingReview = (bookingId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['booking-review', bookingId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      // Get review by booking - need to find trainer from booking first
      const { data: booking, error: bookingError } = await supabase
        .from('trainer_bookings')
        .select('trainer_id')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      const { data, error } = await supabase
        .from('trainer_reviews')
        .select('*')
        .eq('trainer_id', booking.trainer_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!bookingId
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export const useClientReviews = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['client-reviews', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('trainer_reviews')
        .select(`
          *,
          trainer:trainers!trainer_reviews_trainer_id_fkey(name, contact_email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('client-reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `reviewer_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['client-reviews'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewData: {
      bookingId: string;
      trainerId: string;
      rating: number;
      comment?: string;
    }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewee_id: reviewData.trainerId,
          booking_id: reviewData.bookingId,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['client-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-reviews'] });
    },
  });
};

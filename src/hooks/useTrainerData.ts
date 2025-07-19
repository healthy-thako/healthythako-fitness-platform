import { useQuery } from '@tanstack/react-query';
import { supabase, queryWithTimeout } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useTrainerStats = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Real-time subscriptions for live data updates - Temporarily disabled to fix WebSocket issues
  useEffect(() => {
    if (!user) return;

    // TODO: Re-enable realtime subscriptions after fixing WebSocket connection issues
    // const bookingsChannel = supabase
    //   .channel('trainer-bookings-realtime')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'trainer_bookings',
    //       filter: `trainer_id=eq.${user.id}`
    //     },
    //     () => {
    //       queryClient.invalidateQueries({ queryKey: ['trainer-stats', user.id] });
    //     }
    //   )
    //   .subscribe();

    // const transactionsChannel = supabase
    //   .channel('trainer-transactions-realtime')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'payment_transactions',
    //       filter: `trainer_id=eq.${user.id}`
    //     },
    //     () => {
    //       queryClient.invalidateQueries({ queryKey: ['trainer-stats', user.id] });
    //     }
    //   )
    //   .subscribe();

    // const messagesChannel = supabase
    //   .channel('trainer-messages-realtime')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'chat_messages',
    //       filter: `sender_id=eq.${user.id}`
    //     },
    //     () => {
    //       queryClient.invalidateQueries({ queryKey: ['trainer-stats', user.id] });
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(bookingsChannel);
    //   supabase.removeChannel(transactionsChannel);
    //   supabase.removeChannel(messagesChannel);
    // };
  }, [user, queryClient]);
  
  return useQuery({
    queryKey: ['trainer-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      console.log('Fetching trainer stats for user:', user.id);

      // Get active orders count - Need to find trainer ID first
      // First get the trainer record for this user
      const { data: trainerData, error: trainerError } = await (supabase as any)
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (trainerError) {
        console.error('Trainer lookup error:', trainerError);
        // If no trainer record, return empty stats
        return {
          activeOrders: 0,
          monthlyEarnings: 0,
          todaySessions: 0,
          averageRating: 0,
          totalReviews: 0,
          pendingDeliveries: 0,
          unreadMessages: 0,
          upcomingSessions: [],
          responseTime: '1 hour'
        };
      }

      const trainerId = (trainerData as any)?.id;

      // Get active orders count - Using type assertion to bypass TypeScript issues
      const { data: activeOrders, error: ordersError } = await (supabase as any)
        .from('trainer_bookings')
        .select('id')
        .eq('trainer_id', trainerId)
        .in('status', ['pending', 'confirmed']);

      if (ordersError) {
        console.error('Orders error:', ordersError);
        throw ordersError;
      }

      // Get earnings this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyTransactions, error: transactionsError } = await (supabase as any)
        .from('payment_transactions')
        .select('net_amount')
        .eq('trainer_id', trainerId)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      if (transactionsError) {
        console.error('Transactions error:', transactionsError);
        throw transactionsError;
      }

      // Get upcoming sessions today
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySessions, error: sessionsError } = await (supabase as any)
        .from('trainer_bookings')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('session_date', today)
        .in('status', ['confirmed']);

      if (sessionsError) {
        console.error('Sessions error:', sessionsError);
        throw sessionsError;
      }

      // Get average rating - Fixed table name to trainer_reviews
      const { data: reviews, error: reviewsError } = await (supabase as any)
        .from('trainer_reviews')
        .select('rating')
        .eq('trainer_id', trainerId);

      if (reviewsError) {
        console.error('Reviews error:', reviewsError);
        throw reviewsError;
      }

      // Get pending deliveries - Fixed to use trainer_bookings
      const { data: pendingDeliveries, error: deliveriesError } = await (supabase as any)
        .from('trainer_bookings')
        .select('id')
        .eq('trainer_id', trainerId)
        .eq('status', 'pending');

      if (deliveriesError) {
        console.error('Deliveries error:', deliveriesError);
        throw deliveriesError;
      }

      // Get unread messages
      const { data: unreadMessages, error: messagesError } = await (supabase as any)
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (messagesError) {
        console.error('Messages error:', messagesError);
        throw messagesError;
      }

      const totalEarnings = monthlyTransactions?.reduce((sum: number, t: any) => sum + Number(t.net_amount || 0), 0) || 0;
      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

      const stats = {
        activeOrders: activeOrders?.length || 0,
        monthlyEarnings: totalEarnings,
        todaySessions: todaySessions?.length || 0,
        averageRating: Number(avgRating.toFixed(1)),
        totalReviews: reviews?.length || 0,
        pendingDeliveries: pendingDeliveries?.length || 0,
        unreadMessages: unreadMessages?.length || 0,
        upcomingSessions: todaySessions || [],
        responseTime: '1 hour' // Placeholder - would need actual calculation
      };

      console.log('Final stats:', stats);
      return stats;
    },
    enabled: !!user,
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000, // 1 minute for more real-time feel
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Re-export all hooks for convenience
export { useTrainerProfile, useUpdateTrainerProfile } from './useTrainerProfileCRUD';
export { useCreateGig, useTrainerGigs, useUpdateGig, useDeleteGig } from './useGigsCRUD';
export { useTrainerOrders, useUpdateOrderStatus } from './useOrders';
export { useSendMessage, useConversations, useConversationMessages } from './useMessages';
export { useTrainerEarnings } from './useTrainerEarnings';
export { useTrainerAnalytics } from './useTrainerAnalytics';
export { useTrainerWithdrawals, useCreateWithdrawalRequest, useAvailableBalance } from './useWithdrawals';
export { usePaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod } from './usePaymentMethods';

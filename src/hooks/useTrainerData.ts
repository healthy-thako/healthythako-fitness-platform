import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useTrainerStats = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Set up real-time subscriptions for live data updates
  useEffect(() => {
    if (!user) return;

    const bookingsChannel = supabase
      .channel('trainer-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_bookings',
          filter: `trainer_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['trainer-stats', user.id] });
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('trainer-transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions',
          filter: `trainer_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['trainer-stats', user.id] });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('trainer-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['trainer-stats', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, queryClient]);
  
  return useQuery({
    queryKey: ['trainer-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      console.log('Fetching trainer stats for user:', user.id);

      // Get active orders count
      const { data: activeOrders, error: ordersError } = await supabase
        .from('bookings')
        .select('id')
        .eq('trainer_id', user.id)
        .in('status', ['pending', 'accepted', 'in_progress']);

      if (ordersError) {
        console.error('Orders error:', ordersError);
        throw ordersError;
      }

      // Get earnings this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('net_amount')
        .eq('trainer_id', user.id)
        .eq('status', 'completed')
        .gte('transaction_date', startOfMonth.toISOString());

      if (transactionsError) {
        console.error('Transactions error:', transactionsError);
        throw transactionsError;
      }

      // Get upcoming sessions today
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySessions, error: sessionsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('scheduled_date', today)
        .in('status', ['accepted', 'in_progress']);

      if (sessionsError) {
        console.error('Sessions error:', sessionsError);
        throw sessionsError;
      }

      // Get average rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', user.id);

      if (reviewsError) {
        console.error('Reviews error:', reviewsError);
        throw reviewsError;
      }

      // Get pending deliveries
      const { data: pendingDeliveries, error: deliveriesError } = await supabase
        .from('bookings')
        .select('id')
        .eq('trainer_id', user.id)
        .eq('status', 'in_progress');

      if (deliveriesError) {
        console.error('Deliveries error:', deliveriesError);
        throw deliveriesError;
      }

      // Get unread messages
      const { data: unreadMessages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (messagesError) {
        console.error('Messages error:', messagesError);
        throw messagesError;
      }

      const totalEarnings = monthlyTransactions?.reduce((sum, t) => sum + Number(t.net_amount || 0), 0) || 0;
      const avgRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
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

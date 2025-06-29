import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useClientStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['client-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      try {
        // Get all data in parallel for better performance
        const [bookingsResult, favoritesResult, reviewsResult, membershipsResult] = await Promise.all([
          supabase
            .from('bookings')
            .select('status, amount, order_type')
            .eq('client_id', user.id),
          supabase
            .from('favorites')
            .select('id')
            .eq('client_id', user.id),
          supabase
            .from('reviews')
            .select('id')
            .eq('reviewer_id', user.id),
          supabase
            .from('gym_member_purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
        ]);

        // Check for errors
        if (bookingsResult.error) throw bookingsResult.error;
        if (favoritesResult.error) throw favoritesResult.error;
        if (reviewsResult.error) throw reviewsResult.error;
        if (membershipsResult.error) throw membershipsResult.error;

        const bookings = bookingsResult.data || [];
        const favorites = favoritesResult.data || [];
        const reviews = reviewsResult.data || [];
        const memberships = membershipsResult.data || [];

        const stats = {
          totalBookings: bookings.length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          activeBookings: bookings.filter(b => ['confirmed', 'accepted', 'in_progress'].includes(b.status)).length,
          totalSpent: bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
          favoriteTrainers: favorites.length,
          reviewsGiven: reviews.length,
          activeMemberships: memberships.length,
          serviceOrders: bookings.filter(b => b.order_type === 'service').length
        };

        return stats;
      } catch (error) {
        console.error('Error in useClientStats:', error);
        throw error;
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};

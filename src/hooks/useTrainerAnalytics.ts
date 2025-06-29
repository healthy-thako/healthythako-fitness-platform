
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTrainerAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Get bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('trainer_id', user.id);

      if (bookingsError) throw bookingsError;

      // Get gigs data
      const { data: gigs, error: gigsError } = await supabase
        .from('gigs')
        .select('*')
        .eq('trainer_id', user.id);

      if (gigsError) throw gigsError;

      // Get reviews data
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', user.id);

      if (reviewsError) throw reviewsError;

      const totalBookings = bookings?.length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const totalGigs = gigs?.length || 0;
      const activeGigs = gigs?.filter(g => g.status === 'active').length || 0;
      const totalReviews = reviews?.length || 0;
      const averageRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      // Generate monthly bookings data for chart (last 12 months)
      const monthlyBookings = Array.from({ length: 12 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (11 - i));
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const monthBookings = bookings?.filter(b => {
          const bookingDate = new Date(b.created_at);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        }).length || 0;

        return { month: monthName, bookings: monthBookings };
      });

      return {
        totalBookings,
        completedBookings,
        totalGigs,
        activeGigs,
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        monthlyBookings
      };
    },
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for real-time updates
  });
};

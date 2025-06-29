import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Base client stats and data
export { useClientStats } from './client/useClientStats';
export { useClientBookings } from './client/useClientBookings';

// Client data query hook (using individual hooks)
export const useClientData = () => {
  const statsQuery = useClientStats();
  const bookingsQuery = useClientBookings();
  
  return {
    stats: statsQuery.data,
    bookings: bookingsQuery.data,
    isLoading: statsQuery.isLoading || bookingsQuery.isLoading,
    isError: statsQuery.isError || bookingsQuery.isError
  };
};

// Session Notes
export { 
  useSessionNotes, 
  useClientSessionNotes, 
  useCreateSessionNotes, 
  useUpdateSessionNotes 
} from './client/useSessionNotes';

// Membership Actions
export { 
  useMembershipActions, 
  useCreateMembershipAction, 
  usePauseMembership, 
  useResumeMembership, 
  useTransferMembership, 
  useRenewMembership 
} from './client/useMembershipActions';

// Favorites
export { useClientFavorites, useAddToFavorites, useRemoveFromFavorites } from './client/useClientFavorites';
export { 
  useGymFavorites, 
  useAddGymFavorite, 
  useRemoveGymFavorite, 
  useUpdateGymFavoriteNotes 
} from './client/useGymFavorites';

// Reviews
export { 
  useClientReviews, 
  useCreateReview, 
  useUpdateReview, 
  useDeleteReview 
} from './client/useClientReviews';

// Payments and Transactions
export { useClientTransactions, useClientPaymentMethods, useAddPaymentMethod, useRemovePaymentMethod } from './client/useClientPayments';

// Refund Requests
export { 
  useRefundRequests, 
  useCreateRefundRequest, 
  useCreateBookingRefundRequest, 
  useCreateMembershipRefundRequest 
} from './client/useRefundRequests';

// Notification Preferences
export { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences 
} from './client/useNotificationPreferences';

// Keep the messages hook here for now since it's shared between client and trainer
export const useClientMessages = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['client-messages', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(name, email),
          receiver:profiles!messages_receiver_id_fkey(name, email)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

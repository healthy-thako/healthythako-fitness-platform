import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type RefundRequest = Tables<'refund_requests'>;

export const useRefundRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['refund-requests', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('refund_requests')
        .select(`
          *,
          booking:bookings(id, title, amount, trainer:profiles!bookings_trainer_id_fkey(name)),
          membership:gym_member_purchases(
            id, amount_paid, 
            gym:gyms(name),
            plan:gym_membership_plans(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useCreateRefundRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestData: {
      amount: number;
      reason: string;
      booking_id?: string;
      membership_id?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      if (!requestData.booking_id && !requestData.membership_id) {
        throw new Error('Either booking_id or membership_id must be provided');
      }

      const { data, error } = await supabase
        .from('refund_requests')
        .insert({
          user_id: user.id,
          ...requestData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      toast.success('Refund request submitted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit refund request: ' + error.message);
    }
  });
};

export const useCreateBookingRefundRequest = () => {
  const createRefund = useCreateRefundRequest();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      amount, 
      reason 
    }: { 
      bookingId: string; 
      amount: number; 
      reason: string; 
    }) => {
      return createRefund.mutateAsync({
        booking_id: bookingId,
        amount,
        reason
      });
    }
  });
};

export const useCreateMembershipRefundRequest = () => {
  const createRefund = useCreateRefundRequest();

  return useMutation({
    mutationFn: async ({ 
      membershipId, 
      amount, 
      reason 
    }: { 
      membershipId: string; 
      amount: number; 
      reason: string; 
    }) => {
      return createRefund.mutateAsync({
        membership_id: membershipId,
        amount,
        reason
      });
    }
  });
}; 
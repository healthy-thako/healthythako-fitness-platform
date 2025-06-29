
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useTrainerWithdrawals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-withdrawals', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          payment_method:payment_methods(provider, type, details)
        `)
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useCreateWithdrawalRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      amount,
      payment_method_id,
      admin_notes
    }: {
      amount: number;
      payment_method_id: string;
      admin_notes?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          trainer_id: user.id,
          amount,
          payment_method_id,
          admin_notes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-withdrawals'] });
      toast.success('Withdrawal request submitted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit withdrawal request: ' + error.message);
    }
  });
};

export const useAvailableBalance = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-balance', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Get completed transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('net_amount')
        .eq('trainer_id', user.id)
        .eq('status', 'completed');

      if (transError) throw transError;

      // Get withdrawn amounts
      const { data: withdrawals, error: withError } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('trainer_id', user.id)
        .in('status', ['approved', 'processed']);

      if (withError) throw withError;

      const totalEarnings = transactions?.reduce((sum, t) => sum + Number(t.net_amount), 0) || 0;
      const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      return {
        totalEarnings,
        totalWithdrawn,
        availableBalance: totalEarnings - totalWithdrawn
      };
    },
    enabled: !!user
  });
};

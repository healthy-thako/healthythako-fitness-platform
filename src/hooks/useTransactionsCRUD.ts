
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreateTransactionData {
  booking_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  payment_method?: string;
  status?: 'pending' | 'completed' | 'withdrawn';
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transactionData: CreateTransactionData) => {
      if (!user) throw new Error('User not authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          trainer_id: trainer.id,
          amount: transactionData.amount,
          transaction_type: 'booking_payment',
          payment_method: transactionData.payment_method,
          status: transactionData.status || 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
    }
  });
};

export const useTrainerTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          user:users!payment_transactions_user_id_fkey(full_name, email),
          trainer:trainers!payment_transactions_trainer_id_fkey(name, contact_email)
        `)
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ transactionId, status }: {
      transactionId: string;
      status: 'pending' | 'completed' | 'failed' | 'refunded';
    }) => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('payment_transactions')
        .update({ status })
        .eq('id', transactionId)
        .eq('trainer_id', trainer.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
    }
  });
};

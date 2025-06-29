
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
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          trainer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};

export const useTrainerTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          booking:bookings(title, client_id, amount)
        `)
        .eq('trainer_id', user.id)
        .order('transaction_date', { ascending: false });

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
      status: 'pending' | 'completed' | 'withdrawn';
    }) => {
      if (!user) throw new Error('No user authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId)
        .eq('trainer_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};

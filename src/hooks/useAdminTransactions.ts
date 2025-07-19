import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAdminTransactions = (filters?: { status?: string; trainer_id?: string; date_range?: string }) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_transactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-transactions', filters],
    queryFn: async () => {
      console.log('Fetching admin transactions with filters:', filters);
      
      let query = supabase
        .from('payment_transactions')
        .select(`
          *,
          user:users!payment_transactions_user_id_fkey(full_name, email),
          trainer:trainers!payment_transactions_trainer_id_fkey(
            name,
            contact_email,
            users!trainers_user_id_fkey(full_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.trainer_id) {
        query = query.eq('trainer_id', filters.trainer_id);
      }

      if (filters?.date_range) {
        const today = new Date();
        let startDate = new Date();
        
        switch (filters.date_range) {
          case 'today':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            break;
          case 'week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching admin transactions:', error);
        throw error;
      }
      
      console.log('Admin transactions fetched successfully:', data?.length);
      return data;
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1000 * 60 * 5 // Consider data stale after 5 minutes
  });
};

export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, status }: { 
      transactionId: string; 
      status: 'pending' | 'completed' | 'withdrawn' | 'failed';
    }) => {
      console.log('Updating transaction status:', transactionId, status);
      
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useTransactionStats = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('transaction-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      console.log('Fetching transaction stats');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, status, net_amount, commission');
      
      if (error) {
        console.error('Error fetching transaction stats:', error);
        throw error;
      }
      
      const stats = {
        total_revenue: data.reduce((sum, t) => sum + Number(t.amount || 0), 0),
        completed_amount: data
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0),
        pending_amount: data
          .filter(t => t.status === 'pending')
          .reduce((sum, t) => sum + Number(t.amount || 0), 0),
        total_commission: data.reduce((sum, t) => sum + Number(t.commission || 0), 0),
        net_amount: data.reduce((sum, t) => sum + Number(t.net_amount || 0), 0),
        transaction_count: data.length,
        completed_count: data.filter(t => t.status === 'completed').length,
        pending_count: data.filter(t => t.status === 'pending').length
      };
      
      console.log('Transaction stats fetched successfully:', stats);
      return stats;
    },
    retry: 2,
    refetchInterval: 60000,
    staleTime: 1000 * 60 * 2
  });
};

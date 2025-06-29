
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTrainerEarnings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-earnings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      // Get all transactions for this trainer
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('trainer_id', user.id)
        .order('transaction_date', { ascending: false });

      if (transError) throw transError;

      // Calculate earnings
      const allTransactions = transactions || [];
      const completedTransactions = allTransactions.filter(t => t.status === 'completed');
      
      const totalEarnings = completedTransactions.reduce((sum, t) => sum + Number(t.net_amount), 0);
      
      // This month earnings
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const thisMonthEarnings = completedTransactions
        .filter(t => new Date(t.transaction_date) >= startOfMonth)
        .reduce((sum, t) => sum + Number(t.net_amount), 0);

      // Pending earnings
      const pendingEarnings = allTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + Number(t.net_amount), 0);

      return {
        totalEarnings,
        thisMonthEarnings,
        pendingEarnings,
        transactions: allTransactions
      };
    },
    enabled: !!user
  });
};

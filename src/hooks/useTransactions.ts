
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTransactions = () => {
  const { user } = useAuth();
  const isTrainer = user?.user_metadata?.role === 'trainer';
  
  return useQuery({
    queryKey: ['transactions', user?.id, isTrainer ? 'trainer' : 'client'],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      let query = supabase
        .from('payment_transactions')
        .select(`
          *,
          user:users!payment_transactions_user_id_fkey(full_name, email),
          trainer:trainers!payment_transactions_trainer_id_fkey(name, contact_email)
        `)
        .order('created_at', { ascending: false });

      // Filter by user role
      if (isTrainer) {
        query = query.eq('trainer_id', user.id);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useClientTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          booking:trainer_bookings(
            id,
            session_type,
            trainer:trainers!trainer_bookings_trainer_id_fkey(name, contact_email)
          ),
          user:users!payment_transactions_user_id_fkey(full_name, email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
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
          booking:trainer_bookings(
            id,
            session_type,
            user:users!trainer_bookings_user_id_fkey(full_name, email)
          ),
          user:users!payment_transactions_user_id_fkey(full_name, email)
        `)
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

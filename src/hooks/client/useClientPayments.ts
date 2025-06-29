
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useClientTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['client-transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data: bookings, error: bookingsError } = await supabase
        .from('trainer_bookings')
        .select(`
          id, session_date, session_time, total_amount, status, created_at,
          trainer:trainers!trainer_bookings_trainer_id_fkey(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      return bookings || [];
    },
    enabled: !!user
  });
};

export const useClientPaymentMethods = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (paymentData: {
      type: string;
      provider: string;
      details: any;
      is_default?: boolean;
    }) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          ...paymentData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

export const useRemovePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (methodId: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', methodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
};

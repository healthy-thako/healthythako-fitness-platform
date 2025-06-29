
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GymEarning {
  id: string;
  gym_id: string;
  membership_id?: string;
  amount: number;
  commission: number;
  net_amount: number;
  transaction_date: string;
  status: string;
  payment_method?: string;
  created_at: string;
}

export const useGymEarnings = (gymId?: string) => {
  return useQuery({
    queryKey: ['gym-earnings', gymId],
    queryFn: async (): Promise<GymEarning[]> => {
      let query = supabase
        .from('gym_earnings')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (gymId) {
        query = query.eq('gym_id', gymId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gym earnings:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!gymId,
  });
};

export const useCreateGymEarning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (earningData: Omit<GymEarning, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gym_earnings')
        .insert([earningData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-earnings'] });
      toast.success('Earning record created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create earning record: ' + error.message);
    },
  });
};

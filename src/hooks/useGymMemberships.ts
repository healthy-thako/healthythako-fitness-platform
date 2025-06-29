
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GymMemberPurchase {
  id: string;
  user_id: string;
  gym_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'suspended' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  amount_paid: number;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  gym?: {
    id: string;
    name: string;
    address: string;
    city: string;
    area?: string;
    featured_image?: string;
    phone?: string;
    email?: string;
  };
  plan?: {
    id: string;
    name: string;
    description?: string;
    duration_months: number;
    price: number;
    features?: string[];
  };
}

export const useClientGymMemberships = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-gym-memberships', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_memberships')
        .select(`
          *,
          gyms!user_memberships_gym_id_fkey(
            id,
            name,
            address,
            city,
            area,
            featured_image,
            phone,
            email
          ),
          membership_plans!user_memberships_plan_id_fkey(
            id,
            name,
            description,
            duration_days,
            price,
            features
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GymMemberPurchase[];
    },
    enabled: !!user
  });
};

export const useCreateGymMembership = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (membershipData: {
      gym_id: string;
      plan_id: string;
      start_date: string;
      end_date: string;
      amount_paid: number;
      payment_method?: string;
      transaction_id?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gym_member_purchases')
        .insert({
          ...membershipData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-gym-memberships'] });
      toast.success('Gym membership activated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to activate membership: ' + error.message);
    }
  });
};

export const useCancelGymMembership = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (membershipId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gym_member_purchases')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', membershipId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-gym-memberships'] });
      toast.success('Membership cancelled successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to cancel membership: ' + error.message);
    }
  });
};

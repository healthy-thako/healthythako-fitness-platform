import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type GymMembershipPlan = Tables<'membership_plans'>;
export type GymMembershipPlanInsert = TablesInsert<'membership_plans'>;
export type GymMembershipPlanUpdate = TablesUpdate<'membership_plans'>;

export const useGymMembershipPlans = (gymId?: string) => {
  return useQuery({
    queryKey: ['gym-membership-plans', gymId],
    queryFn: async (): Promise<GymMembershipPlan[]> => {
      if (!gymId) return [];

      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', gymId)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!gymId,
  });
};

// Hook to fetch all membership plans (for gym browsing page)
export const useAllGymMembershipPlans = () => {
  return useQuery({
    queryKey: ['all-gym-membership-plans'],
    queryFn: async (): Promise<GymMembershipPlan[]> => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateGymMembershipPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: GymMembershipPlanInsert) => {
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('membership_plans')
        .insert([planData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-membership-plans', variables.gym_id] });
      toast.success('Membership plan created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create membership plan:', error);
      toast.error('Failed to create membership plan');
    },
  });
};

export const useUpdateGymMembershipPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: GymMembershipPlanUpdate }) => {
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('membership_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gym-membership-plans', data.gym_id] });
      toast.success('Membership plan updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update membership plan:', error);
      toast.error('Failed to update membership plan');
    },
  });
};

export const useDeleteGymMembershipPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ planId, gymId }: { planId: string; gymId: string }) => {
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      return { gymId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gym-membership-plans', data.gymId] });
      toast.success('Membership plan deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete membership plan:', error);
      toast.error('Failed to delete membership plan');
    },
  });
};

export const useCreateGymMembershipPlans = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gymId, plans }: { gymId: string; plans: Omit<GymMembershipPlanInsert, 'gym_id'>[] }) => {
      if (!user) throw new Error('Authentication required');

      const plansWithGymId = plans.map(plan => ({ ...plan, gym_id: gymId }));
      
      const { data, error } = await supabase
        .from('membership_plans')
        .insert(plansWithGymId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-membership-plans', variables.gymId] });
      toast.success('Membership plans created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create membership plans:', error);
      toast.error('Failed to create membership plans');
    },
  });
};

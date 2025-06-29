import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useMembershipActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const pauseMembership = useMutation({
    mutationFn: async ({ membershipId, reason }: { membershipId: string; reason: string }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gym_member_purchases')
        .update({ 
          status: 'paused',
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
      toast.success('Membership paused successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to pause membership: ' + error.message);
    }
  });

  const resumeMembership = useMutation({
    mutationFn: async ({ membershipId, reason }: { membershipId: string; reason: string }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gym_member_purchases')
        .update({ 
          status: 'active',
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
      toast.success('Membership resumed successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to resume membership: ' + error.message);
    }
  });

  const transferMembership = useMutation({
    mutationFn: async ({ 
      membershipId, 
      transferToUserId, 
      reason 
    }: { 
      membershipId: string; 
      transferToUserId: string; 
      reason: string; 
    }) => {
      if (!user) throw new Error('No user authenticated');

      // This would require admin approval in a real app
      const { data, error } = await supabase
        .from('gym_member_purchases')
        .update({ 
          user_id: transferToUserId,
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
      toast.success('Membership transfer request submitted');
    },
    onError: (error: any) => {
      toast.error('Failed to transfer membership: ' + error.message);
    }
  });

  const renewMembership = useMutation({
    mutationFn: async ({ 
      membershipId, 
      newEndDate, 
      reason 
    }: { 
      membershipId: string; 
      newEndDate: string; 
      reason: string; 
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gym_member_purchases')
        .update({ 
          end_date: newEndDate,
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
      toast.success('Membership renewed successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to renew membership: ' + error.message);
    }
  });

  return {
    pauseMembership,
    resumeMembership,
    transferMembership,
    renewMembership
  };
};

export const useCreateMembershipAction = () => {
  return useMembershipActions();
};

export const usePauseMembership = () => {
  const { pauseMembership } = useMembershipActions();
  return pauseMembership;
};

export const useResumeMembership = () => {
  const { resumeMembership } = useMembershipActions();
  return resumeMembership;
};

export const useTransferMembership = () => {
  const { transferMembership } = useMembershipActions();
  return transferMembership;
};

export const useRenewMembership = () => {
  const { renewMembership } = useMembershipActions();
  return renewMembership;
}; 
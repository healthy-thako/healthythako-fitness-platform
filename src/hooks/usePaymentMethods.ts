
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePaymentMethods = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      type,
      provider,
      details,
      is_default = false
    }: {
      type: string;
      provider: string;
      details: any;
      is_default?: boolean;
    }) => {
      if (!user) throw new Error('No user authenticated');

      // If this is set as default, unset other defaults first
      if (is_default) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type,
          provider,
          details,
          is_default,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add payment method: ' + error.message);
    }
  });
};

export const useAddPaymentMethod = useCreatePaymentMethod;

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      methodId, 
      updates 
    }: { 
      methodId: string; 
      updates: {
        type?: string;
        provider?: string;
        details?: any;
        is_default?: boolean;
        is_active?: boolean;
      };
    }) => {
      if (!user) throw new Error('No user authenticated');

      // If setting as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', methodId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update payment method: ' + error.message);
    }
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (methodId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('Payment method deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete payment method: ' + error.message);
    }
  });
};

export const useRemovePaymentMethod = useDeletePaymentMethod;

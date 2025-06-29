import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getAdminHeaders } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface AdminTrainersFilters {
  status?: string;
  search?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
}

export const useAdminTrainers = (filters: AdminTrainersFilters = {}) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-trainers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainer_profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-trainers', filters],
    queryFn: async () => {
      console.log('Fetching admin trainers with filters:', filters);
      
      // Use admin-users Edge Function for proper authentication
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'getTrainers',
          filters: filters
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error fetching admin trainers:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to fetch trainers');
      }

      console.log('Admin trainers fetched successfully:', data?.length);
      return data;
    },
    retry: 2,
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5
  });
};

export const useUpdateTrainerStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ trainerId, updates }: { trainerId: string; updates: any }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'updateTrainer',
          updates: { trainerId, ...updates }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error updating trainer:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to update trainer');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update trainer status',
        variant: 'destructive',
      });
    },
  });
};

export const useVerifyTrainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ trainerId, notes }: { trainerId: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'verifyTrainerProfile',
          updates: { trainerId, notes }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error verifying trainer:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to verify trainer');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      toast({
        title: 'Success',
        description: 'Trainer has been verified successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify trainer',
        variant: 'destructive',
      });
    },
  });
};

export const useRejectTrainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ trainerId, notes }: { trainerId: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'rejectTrainerProfile',
          updates: { trainerId, notes }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error rejecting trainer:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to reject trainer');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      toast({
        title: 'Success',
        description: 'Trainer has been rejected',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject trainer',
        variant: 'destructive',
      });
    },
  });
};

export const useSuspendTrainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'updateTrainer',
          updates: { trainerId, is_active: false }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error suspending trainer:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to suspend trainer');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      toast({
        title: 'Success',
        description: 'Trainer has been suspended',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to suspend trainer',
        variant: 'destructive',
      });
    },
  });
};

export const useActivateTrainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (trainerId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'updateTrainer',
          updates: { trainerId, is_active: true }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error activating trainer:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to activate trainer');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      toast({
        title: 'Success',
        description: 'Trainer has been activated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate trainer',
        variant: 'destructive',
      });
    },
  });
};

export const useTrainerStats = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['admin-trainer-stats'],
    queryFn: async () => {
      console.log('Fetching trainer stats');
      
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'getTrainerStats'
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error fetching trainer stats:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to fetch trainer stats');
      }

      return data;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (trainerData: any) => {
      console.log('Creating trainer via admin-users edge function:', trainerData);
      
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'createTrainer',
          userData: trainerData
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error creating trainer:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to create trainer');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainers'] });
      toast({
        title: 'Success',
        description: 'Trainer has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create trainer',
        variant: 'destructive',
      });
    },
  });
}; 
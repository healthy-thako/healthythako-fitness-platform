import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getAdminHeaders } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface AdminGymsFilters {
  status?: string;
  search?: string;
  city?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
}

export const useAdminGyms = (filters: AdminGymsFilters = {}) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-gyms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gyms'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gym_owners'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-gyms', filters],
    queryFn: async () => {
      console.log('Fetching admin gyms with filters:', filters);
      
      // Use admin-users Edge Function for proper authentication
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'getGyms',
          filters: filters
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error fetching admin gyms:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to fetch gyms');
      }
      
      console.log('Admin gyms fetched successfully:', data?.length);
      return data;
    },
    retry: 2,
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5
  });
};

export const useUpdateGymStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ gymId, updates }: { gymId: string; updates: any }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'updateGym',
          updates: { gymId, ...updates }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error updating gym:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to update gym');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update gym status',
        variant: 'destructive',
      });
    },
  });
};

export const useVerifyGym = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ gymId, notes }: { gymId: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'verifyGym',
          updates: { gymId, notes }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error verifying gym:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to verify gym');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      toast({
        title: 'Success',
        description: 'Gym has been verified successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify gym',
        variant: 'destructive',
      });
    },
  });
};

export const useRejectGym = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ gymId, notes }: { gymId: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'rejectGym',
          updates: { gymId, notes }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error rejecting gym:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to reject gym');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      toast({
        title: 'Success',
        description: 'Gym has been rejected',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject gym',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteGym = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (gymId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'deleteGym',
          updates: { gymId }
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error deleting gym:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to delete gym');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      toast({
        title: 'Success',
        description: 'Gym has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete gym',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateGym = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (gymData: any) => {
      console.log('Creating gym via admin-users edge function:', gymData);
      
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'createGym',
          userData: gymData
        },
        headers: getAdminHeaders()
      });

      if (error) {
        console.error('Error creating gym:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to create gym');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
      toast({
        title: 'Success',
        description: 'Gym has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create gym',
        variant: 'destructive',
      });
    },
  });
};

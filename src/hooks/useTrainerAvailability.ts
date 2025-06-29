import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Trainer Availability Management
export const useTrainerAvailability = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-availability', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('trainer_availability' as any)
        .select('*')
        .eq('trainer_id', user.id)
        .gte('date', new Date().toISOString().split('T')[0]) // Only future dates
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (availabilityData: {
      date: string;
      start_time: string;
      end_time: string;
      status: 'available' | 'busy' | 'blocked';
      notes?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainer_availability' as any)
        .insert({
          trainer_id: user.id,
          ...availabilityData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      toast.success('Availability added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add availability: ' + error.message);
    }
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: {
      id: string;
      date?: string;
      start_time?: string;
      end_time?: string;
      status?: 'available' | 'busy' | 'blocked';
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('trainer_availability' as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      toast.success('Availability updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update availability: ' + error.message);
    }
  });
};

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trainer_availability' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      toast.success('Availability deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete availability: ' + error.message);
    }
  });
}; 
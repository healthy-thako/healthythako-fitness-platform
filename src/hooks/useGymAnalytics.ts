
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GymAnalytics {
  id: string;
  gym_id: string;
  date: string;
  new_members: number;
  total_members: number;
  revenue: number;
  bookings_count: number;
  created_at: string;
}

export const useGymAnalytics = (gymId?: string) => {
  return useQuery({
    queryKey: ['gym-analytics', gymId],
    queryFn: async (): Promise<GymAnalytics[]> => {
      let query = supabase
        .from('gym_analytics')
        .select('*')
        .order('date', { ascending: false });

      if (gymId) {
        query = query.eq('gym_id', gymId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gym analytics:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!gymId,
  });
};

export const useCreateGymAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analyticsData: Omit<GymAnalytics, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gym_analytics')
        .insert([analyticsData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-analytics'] });
      toast.success('Analytics data updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update analytics: ' + error.message);
    },
  });
};

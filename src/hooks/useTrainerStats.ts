
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrainerStats {
  user_id: string;
  name: string;
  email: string;
  total_bookings: number;
  completed_bookings: number;
  total_reviews: number;
  average_rating: number;
  total_earnings: number;
}

export const useTrainerStats = (trainerId?: string) => {
  return useQuery({
    queryKey: ['trainer-stats', trainerId],
    queryFn: async (): Promise<TrainerStats | null> => {
      if (!trainerId) return null;

      const { data, error } = await supabase
        .from('trainer_stats')
        .select('*')
        .eq('user_id', trainerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching trainer stats:', error);
        throw error;
      }

      return data;
    },
    enabled: !!trainerId,
  });
};

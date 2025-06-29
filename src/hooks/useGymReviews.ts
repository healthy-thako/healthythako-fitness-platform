
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GymReview {
  id: string;
  gym_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const useGymReviews = (gymId?: string) => {
  return useQuery({
    queryKey: ['gym-reviews', gymId],
    queryFn: async (): Promise<GymReview[]> => {
      if (!gymId) return [];

      const { data, error } = await supabase
        .from('gym_reviews')
        .select(`
          *,
          user:profiles!gym_reviews_user_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gym reviews:', error);
        throw error;
      }

      return (data || []) as GymReview[];
    },
    enabled: !!gymId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

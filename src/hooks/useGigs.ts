import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Keep existing usePublicGigs for backward compatibility
export const usePublicGigs = (filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['public-gigs', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('gigs')
          .select('*')
          .eq('status', 'active');

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        if (filters?.minPrice) {
          query = query.gte('basic_price', filters.minPrice);
        }

        if (filters?.maxPrice) {
          query = query.lte('basic_price', filters.maxPrice);
        }

        if (filters?.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data: gigs, error: gigsError } = await query.order('created_at', { ascending: false });

        if (gigsError) throw gigsError;

        if (!gigs || gigs.length === 0) return [];

        // Get trainer data for all gigs using the correct schema
        const trainerIds = [...new Set(gigs.map(gig => gig.trainer_id))];

        const { data: trainers, error: trainersError } = await supabase
          .from('trainers')
          .select(`
            id,
            user_id,
            name,
            image_url,
            specialties,
            pricing,
            users!trainers_user_id_fkey(full_name, email)
          `)
          .in('id', trainerIds);

        if (trainersError) console.error('Error fetching trainers:', trainersError);

        // Map gigs with trainer data
        return gigs.map(gig => {
          const trainer = trainers?.find(t => t.id === gig.trainer_id);

          return {
            ...gig,
            trainer: {
              id: gig.trainer_id,
              user_id: trainer?.user_id,
              name: trainer?.name || trainer?.users?.full_name || 'Unknown Trainer',
              email: trainer?.users?.email || '',
              rate_per_hour: trainer?.pricing?.hourly_rate || 0,
              specializations: trainer?.specialties || [],
              profile_image: trainer?.image_url,
              profile: {
                name: trainer?.name || trainer?.users?.full_name || 'Unknown Trainer',
                email: trainer?.users?.email || ''
              }
            }
          };
        });
      } catch (error) {
        console.error('Error fetching public gigs:', error);
        return [];
      }
    },
    retry: 1
  });
};

// Re-export from the new CRUD hooks
export { useTrainerGigs, useCreateGig, useUpdateGig, useDeleteGig } from './useGigsCRUD';

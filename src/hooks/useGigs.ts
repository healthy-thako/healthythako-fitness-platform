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

        // Get trainer profiles for all gigs
        const trainerIds = [...new Set(gigs.map(gig => gig.trainer_id))];
        
        const { data: trainerProfiles, error: trainersError } = await supabase
          .from('trainer_profiles')
          .select('user_id, rate_per_hour, specializations, profile_image')
          .in('user_id', trainerIds);

        if (trainersError) console.error('Error fetching trainer profiles:', trainersError);

        const { data: userProfiles, error: userProfilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', trainerIds);

        if (userProfilesError) console.error('Error fetching user profiles:', userProfilesError);

        // Map gigs with trainer data
        return gigs.map(gig => {
          const trainerProfile = trainerProfiles?.find(tp => tp.user_id === gig.trainer_id);
          const userProfile = userProfiles?.find(up => up.id === gig.trainer_id);
          
          return {
            ...gig,
            trainer: {
              id: gig.trainer_id,
              rate_per_hour: trainerProfile?.rate_per_hour || 0,
              specializations: trainerProfile?.specializations || [],
              profile_image: trainerProfile?.profile_image,
              profile: {
                name: userProfile?.name || 'Unknown Trainer',
                email: userProfile?.email || ''
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

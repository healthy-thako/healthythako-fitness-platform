import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface TrainerSearchFilters {
  search?: string;
  location?: string;
  specializations?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  gender?: string;
  experienceLevel?: string;
  rating?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  sortBy?: 'rating' | 'price_low' | 'price_high' | 'experience' | 'name';
}

export const useTrainerSearch = (filters: TrainerSearchFilters) => {
  const queryClient = useQueryClient();

  // Real-time subscriptions temporarily disabled to avoid WebSocket connection issues
  // TODO: Enable after configuring real-time properly in Supabase
  // useEffect(() => {
  //   const trainersChannel = supabase
  //     .channel('trainer-search-trainers')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'trainers'
  //       },
  //       (payload) => {
  //         console.log('Trainer change detected:', payload);
  //         queryClient.invalidateQueries({ queryKey: ['trainers', 'search'] });
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(trainersChannel);
  //   };
  // }, [queryClient]);

  return useQuery({
    queryKey: ['trainers', 'search', filters],
    queryFn: async () => {
      console.log('Searching trainers with filters:', filters);
      
      try {
        // Use the new search_trainers function for better performance
        // Map frontend filters to backend function parameters
        const searchQuery = filters.search || '';
        const specialtyFilter = filters.specializations?.[0] || filters.specialization || '';



        const { data, error } = await supabase.rpc('search_trainers', {
          search_query: searchQuery,
          specialty_filter: specialtyFilter,
          gym_id_filter: filters.gymId || null,
          min_rating: filters.rating || filters.minRating || 0,
          limit_count: filters.limit || 20,
          offset_count: filters.offset || 0
        });

        if (error) {
          console.error('Error searching trainers:', error);
          throw error;
        }

        // The search_trainers function already returns enriched data with ratings and reviews
        // Apply additional client-side filters if needed
        let filteredTrainers = data || [];

        // Apply price range filter if specified
        if (filters.priceRange) {
          filteredTrainers = filteredTrainers.filter(trainer => {
            const pricing = trainer.pricing as any;
            const rate = pricing?.hourly_rate || 0;
            return rate >= filters.priceRange!.min && rate <= filters.priceRange!.max;
          });
        }

        // Apply experience level filter if specified
        if (filters.experienceLevel && filters.experienceLevel !== 'all') {
          filteredTrainers = filteredTrainers.filter(trainer => {
            const experience = trainer.experience || '';
            const years = parseInt(experience) || 0;
            switch (filters.experienceLevel) {
              case 'beginner':
                return years <= 2;
              case 'intermediate':
                return years > 2 && years <= 5;
              case 'expert':
                return years > 5;
              default:
                return true;
            }
          });
        }



        // Apply rating filter (data already includes ratings from search_trainers function)
        let finalTrainers = filteredTrainers;
        if (filters.rating && filters.rating > 0) {
          finalTrainers = finalTrainers.filter(trainer =>
            (trainer.rating || 0) >= filters.rating!
          );
        }

        // Apply sorting (updated for new data structure)
        if (filters.sortBy) {
          finalTrainers.sort((a, b) => {
            switch (filters.sortBy) {
              case 'price_low':
                const priceA = (a.pricing as any)?.hourly_rate || 0;
                const priceB = (b.pricing as any)?.hourly_rate || 0;
                return priceA - priceB;
              case 'price_high':
                const priceHighA = (a.pricing as any)?.hourly_rate || 0;
                const priceHighB = (b.pricing as any)?.hourly_rate || 0;
                return priceHighB - priceHighA;
              case 'experience':
                const expA = parseInt(a.experience || '0') || 0;
                const expB = parseInt(b.experience || '0') || 0;
                return expB - expA;
              case 'name':
                return (a.name || '').localeCompare(b.name || '');
              default: // rating
                return (b.rating || 0) - (a.rating || 0);
            }
          });
        } else {
          // Default sort by rating then by name
          finalTrainers.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            if (ratingB !== ratingA) {
              return ratingB - ratingA;
            }
            return (a.name || '').localeCompare(b.name || '');
          });
        }


        return finalTrainers;

      } catch (error) {
        console.error('Error in trainer search:', error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
};

export const useTrainerSpecializations = () => {
  return useQuery({
    queryKey: ['trainer-specializations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('specialties')
        .not('specialties', 'is', null);

      if (error) throw error;

      // Extract unique specializations
      const specializations = new Set<string>();
      data?.forEach((trainer: any) => {
        trainer.specialties?.forEach((spec: string) => specializations.add(spec));
      });

      return Array.from(specializations).sort();
    },
    staleTime: 1000 * 60 * 10 // 10 minutes
  });
};

// Hook for getting a single trainer with complete data - UPDATED for new schema
export const useTrainerDetails = (trainerId: string) => {
  return useQuery({
    queryKey: ['trainer-details', trainerId],
    queryFn: async () => {
      if (!trainerId) throw new Error('No trainer ID provided');

      // Get trainer data with user info from new schema
      const { data: trainer, error: trainerError } = await supabase
        .from('trainers')
        .select(`
          *,
          users!inner (
            id,
            full_name,
            email,
            phone_number,
            avatar_url,
            created_at
          )
        `)
        .eq('id', trainerId)
        .single();

      if (trainerError) throw trainerError;

      // Get reviews with reviewer details (updated for new schema)
      const { data: reviews } = await supabase
        .from('trainer_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          users!trainer_reviews_user_id_fkey(full_name)
        `)
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });

      // Get completed bookings for stats
      const { data: completedBookings } = await supabase
        .from('trainer_bookings')
        .select('id')
        .eq('trainer_id', trainerId)
        .eq('status', 'completed');

      // Return enriched trainer data
      return {
        ...trainer,
        reviews: reviews || [],
        completed_bookings: completedBookings?.length || 0,
        average_rating: trainer.average_rating || 0,
        total_reviews: trainer.total_reviews || 0
      };
    },
    enabled: !!trainerId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

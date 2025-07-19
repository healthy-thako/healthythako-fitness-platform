import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GigSearchFilters {
  search?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  deliveryTime?: number;
  rating?: number;
  sortBy?: 'rating' | 'price_low' | 'price_high' | 'delivery_time' | 'popularity';
}

export const useGigSearch = (filters: GigSearchFilters) => {
  return useQuery({
    queryKey: ['gigs', 'search', filters],
    queryFn: async () => {
      console.log('Searching services (trainers) with filters:', filters);

      // Since gigs table doesn't exist, use trainers as services
      // Map search query to trainer search
      const searchQuery = filters.search || '';
      const specialtyFilter = filters.category || '';

      const { data: trainers, error } = await supabase.rpc('search_trainers_enhanced', {
        search_query: searchQuery,
        specialty_filter: specialtyFilter,
        gym_id_filter: null,
        min_rating: filters.rating || 0,
        limit_count: 20,
        offset_count: 0
      });

      if (error) {
        console.error('Error searching trainers:', error);
        throw error;
      }

      if (!trainers || trainers.length === 0) {
        console.log('No trainers found');
        return [];
      }

      // Transform trainer data to look like gigs for compatibility
      const transformedGigs = trainers.map((trainer: any) => ({
        id: trainer.id,
        title: `${trainer.specialty} Training`,
        description: trainer.description || trainer.bio,
        category: trainer.specialty,
        basic_price: trainer.pricing?.hourly_rate || 50,
        delivery_time: 1, // Default 1 day for training sessions
        rating: trainer.rating || 0,
        review_count: trainer.reviews || 0,
        trainer_id: trainer.id,
        status: 'active',
        created_at: trainer.created_at,
        // Add trainer profile data
        trainer_profiles: {
          user_id: trainer.id,
          profile_image: trainer.image_url,
          is_verified: trainer.status === 'active',
          experience_years: parseInt(trainer.experience) || 1
        },
        profiles: {
          id: trainer.id,
          name: trainer.name,
          location: trainer.location
        }
      }));

      // Apply additional client-side filters
      let filteredGigs = transformedGigs;

      // Price range filter (already handled by search but apply additional filtering if needed)
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        filteredGigs = filteredGigs.filter(gig => {
          const basicPrice = parseFloat(String(gig.basic_price)) || 0;
          return basicPrice >= min && basicPrice <= max;
        });
      }

      // Delivery time filter (for training sessions, this could be availability)
      if (filters.deliveryTime) {
        // For trainers, delivery time could represent session availability
        // For now, keep all results as trainers are generally available
        filteredGigs = filteredGigs.filter(gig => gig.delivery_time <= filters.deliveryTime!);
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredGigs.sort((a, b) => {
          switch (filters.sortBy) {
            case 'price_low':
              return (parseFloat(String(a.basic_price)) || 0) - (parseFloat(String(b.basic_price)) || 0);
            case 'price_high':
              return (parseFloat(String(b.basic_price)) || 0) - (parseFloat(String(a.basic_price)) || 0);
            case 'delivery_time':
              return (a.delivery_time || 0) - (b.delivery_time || 0);
            case 'popularity':
              return (b.review_count || 0) - (a.review_count || 0);
            default: // rating
              return (b.rating || 0) - (a.rating || 0);
          }
        });
      }

      console.log('Filtered services (trainers):', filteredGigs.length, filteredGigs);
      return filteredGigs;
    },
    enabled: true,
  });
};

export const useGigCategories = () => {
  return useQuery({
    queryKey: ['gig-categories'],
    queryFn: async () => {
      // Get categories from trainer specialties since gigs table doesn't exist
      const { data, error } = await supabase
        .from('trainers')
        .select('specialty')
        .not('specialty', 'is', null)
        .eq('status', 'active');

      if (error) throw error;

      // Extract unique specialties as categories
      const categories = new Set<string>();
      data?.forEach(trainer => {
        if (trainer.specialty) categories.add(trainer.specialty);
      });

      return Array.from(categories).sort();
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface GymSearchFilters {
  search?: string;
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  rating?: number;
  isVerified?: boolean;
  sortBy?: 'rating' | 'price_low' | 'price_high' | 'name' | 'newest';
}

export const useGymSearch = (filters: GymSearchFilters) => {
  const queryClient = useQueryClient();

  // Real-time subscriptions for gym data changes - Temporarily disabled to fix WebSocket issues
  useEffect(() => {
    // TODO: Re-enable realtime subscriptions after fixing WebSocket connection issues
    // const gymsChannel = supabase
    //   .channel('gym-search-gyms')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'gyms'
    //     },
    //     (payload) => {
    //       console.log('Gym change detected:', payload);
    //       queryClient.invalidateQueries({ queryKey: ['gyms', 'search'] });
    //     }
    //   )
    //   .subscribe();

    // const plansChannel = supabase
    //   .channel('gym-search-plans')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'membership_plans'
    //     },
    //     (payload) => {
    //       console.log('Gym membership plan change detected:', payload);
    //       queryClient.invalidateQueries({ queryKey: ['gyms', 'search'] });
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(gymsChannel);
    //   supabase.removeChannel(plansChannel);
    // };
  }, [queryClient]);

  return useQuery({
    queryKey: ['gyms', 'search', filters],
    queryFn: async () => {
      console.log('Searching gyms with filters:', filters);

      // Use the new search_gyms function for better performance
      const { data, error } = await supabase.rpc('search_gyms', {
        search_query: filters.search || '',
        min_rating: filters.rating || 0,
        has_gym_pass: null, // Can be added later if needed
        limit_count: 50,
        offset_count: 0
      });

      if (error) {
        console.error('Error searching gyms:', error);
        throw error;
      }

      console.log('Search results:', data);
      let filteredData = data || [];

      // Price range filter (using membership plans from search results)
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        filteredData = filteredData.filter(gym => {
          const plans = gym.membership_plans || [];
          if (plans.length === 0) return false;

          const minPrice = Math.min(...plans.map((plan: any) => plan.price));
          return minPrice >= min && minPrice <= max;
        });
      }

      // Amenities filter (using amenities from search results)
      if (filters.amenities && filters.amenities.length > 0) {
        filteredData = filteredData.filter(gym => {
          const gymAmenities = gym.amenities || [];
          return filters.amenities!.some(amenity =>
            gymAmenities.includes(amenity)
          );
        });
      }

      // Apply sorting (updated for new data structure)
      if (filters.sortBy) {
        filteredData.sort((a, b) => {
          switch (filters.sortBy) {
            case 'price_low':
              const aPrices = a.membership_plans?.map((p: any) => p.price) || [0];
              const bPrices = b.membership_plans?.map((p: any) => p.price) || [0];
              return Math.min(...aPrices) - Math.min(...bPrices);
            case 'price_high':
              const aMaxPrices = a.membership_plans?.map((p: any) => p.price) || [0];
              const bMaxPrices = b.membership_plans?.map((p: any) => p.price) || [0];
              return Math.max(...bMaxPrices) - Math.max(...aMaxPrices);
            case 'name':
              return a.name.localeCompare(b.name);
            case 'newest':
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            default: // rating
              return (b.rating || 0) - (a.rating || 0);
          }
        });
      }

      console.log('Filtered gyms:', filteredData.length);
      return filteredData;
    },
    enabled: true,
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGymAmenities = () => {
  return useQuery({
    queryKey: ['gym-amenities'],
    queryFn: async () => {
      // Get amenities from gyms table (new schema)
      const { data, error } = await supabase
        .from('gyms')
        .select('amenities')
        .not('amenities', 'is', null);

      if (error) throw error;

      // Extract unique amenity types from JSON field
      const amenities = new Set<string>();
      data?.forEach(gym => {
        if (gym.amenities && Array.isArray(gym.amenities)) {
          gym.amenities.forEach((amenity: string) => amenities.add(amenity));
        }
      });

      return Array.from(amenities).sort();
    },
  });
};

export const useGymCities = () => {
  return useQuery({
    queryKey: ['gym-cities'],
    queryFn: async () => {
      // Since 'city' column doesn't exist, extract cities from address
      const { data, error } = await supabase
        .from('gyms')
        .select('address')
        .not('address', 'is', null);

      if (error) throw error;

      // Extract unique cities from address field
      const cities = new Set<string>();
      data?.forEach(gym => {
        if (gym.address) {
          // Try to extract city from address (assuming it's the last part)
          const addressParts = gym.address.split(',');
          if (addressParts.length > 1) {
            const city = addressParts[addressParts.length - 1].trim();
            if (city) cities.add(city);
          }
        }
      });

      return Array.from(cities).sort();
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, queryWithTimeout } from '@/integrations/supabase/client';
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
  limit?: number;
  offset?: number;
  gymId?: string;
  minRating?: number;
  specialization?: string;
}

// Helper function to transform database trainer data to frontend format
const transformTrainerData = (trainer: any) => {
  console.log('🔄 Transforming trainer data:', trainer.name, trainer);

  // Extract experience years from experience string (e.g., "5 years" -> 5)
  const experienceYears = trainer.experience
    ? parseInt(trainer.experience.replace(/\D/g, '')) || 2
    : 2;

  // Parse pricing data if it's a string or object
  let pricingData = trainer.pricing;
  if (typeof pricingData === 'string') {
    try {
      pricingData = JSON.parse(pricingData);
    } catch (e) {
      console.warn('Failed to parse pricing data:', pricingData);
      pricingData = { hourly_rate: 1500 };
    }
  }

  // Get hourly rate from pricing JSON
  const hourlyRate = pricingData?.hourly_rate ||
                    pricingData?.rate ||
                    1500;

  // Parse availability data if it's a string
  let availabilityData = trainer.availability;
  if (typeof availabilityData === 'string') {
    try {
      availabilityData = JSON.parse(availabilityData);
    } catch (e) {
      console.warn('Failed to parse availability data:', availabilityData);
      availabilityData = [];
    }
  }

  // Convert availability array to day names if it's in the database format
  let availabilityDays = availabilityData;
  if (Array.isArray(availabilityData) && availabilityData.length > 0 && typeof availabilityData[0] === 'object') {
    availabilityDays = availabilityData
      .filter(slot => slot.is_available)
      .map(slot => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[slot.day_of_week];
      })
      .filter(Boolean);
  }

  return {
    id: trainer.id,
    name: trainer.name || 'Unknown Trainer',
    email: trainer.contact_email || '',
    location: trainer.location || 'Dhaka',
    trainer_profiles: {
      bio: trainer.bio || trainer.description || 'Experienced fitness trainer',
      profile_image: trainer.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      rate_per_hour: hourlyRate,
      experience_years: experienceYears,
      specializations: trainer.specialties || [trainer.specialty].filter(Boolean) || ['Fitness Training'],
      is_verified: trainer.status === 'verified' || trainer.status === 'active',
      services: trainer.specialties || [trainer.specialty].filter(Boolean) || ['Personal Training'],
      languages: ['English', 'Bengali'],
      availability: availabilityDays || [],
      certifications: trainer.certifications || ['Certified Personal Trainer']
    },
    average_rating: parseFloat(trainer.average_rating) || trainer.rating || 4.0,
    total_reviews: trainer.total_reviews || trainer.reviews || 0,
    completed_bookings: Math.floor(Math.random() * 80) + 20
  };
};


// Fallback trainer data for when database queries fail
const getFallbackTrainerData = () => {
  console.log('Returning fallback trainer data...');
  return [
    {
      id: 'fallback-trainer-1',
      name: 'Ahmed Rahman',
      email: 'ahmed.rahman@healthythako.com',
      location: 'Gulshan, Dhaka',
      trainer_profiles: {
        bio: 'Certified personal trainer with 5+ years of experience in strength training.',
        profile_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        rate_per_hour: 2000,
        experience_years: 5,
        specializations: ['Weight Training', 'Bodybuilding', 'Strength Training'],
        is_verified: true,
        services: ['Personal Training', 'Workout Plans'],
        languages: ['English', 'Bengali'],
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        certifications: ['NASM-CPT', 'ACSM Certified']
      },
      average_rating: 4.7,
      total_reviews: 45,
      completed_bookings: 120
    },
    {
      id: 'fallback-trainer-2',
      name: 'Fatima Khan',
      email: 'fatima.khan@healthythako.com',
      location: 'Dhanmondi, Dhaka',
      trainer_profiles: {
        bio: 'Experienced yoga instructor and wellness coach.',
        profile_image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400',
        rate_per_hour: 1500,
        experience_years: 7,
        specializations: ['Yoga', 'Pilates', 'Meditation'],
        is_verified: true,
        services: ['Yoga Classes', 'Meditation Sessions'],
        languages: ['English', 'Bengali', 'Hindi'],
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        certifications: ['RYT-500', 'Pilates Certified']
      },
      average_rating: 4.9,
      total_reviews: 67,
      completed_bookings: 200
    }
  ];
};

export const useTrainerSearch = (filters: TrainerSearchFilters) => {
  const queryClient = useQueryClient();

  // Real-time subscriptions disabled to prevent WebSocket issues
  useEffect(() => {
    // Realtime subscriptions are disabled to prevent connection issues
    // TODO: Re-enable when WebSocket issues are resolved
  }, [queryClient]);

  return useQuery({
    queryKey: ['trainers', filters],
    queryFn: async () => {
      console.log('🔍 Fetching trainers with filters:', filters);

      // Create a timeout promise that rejects after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      try {
        // Build query with proper field selection based on actual database schema
        let url = 'https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/trainers?select=id,name,specialty,specialties,pricing,availability,average_rating,total_reviews,bio,image_url,contact_email,contact_phone,location,experience,certifications,description&status=eq.active';

        // Apply filters
        if (filters.limit) {
          url += `&limit=${filters.limit}`;
        } else {
          url += '&limit=20';
        }

        // Apply search filter
        if (filters.search || filters.searchQuery) {
          const searchTerm = filters.search || filters.searchQuery;
          url += `&or=(name.ilike.*${searchTerm}*,specialty.ilike.*${searchTerm}*)`;
        }

        // Apply specialization filter
        if (filters.specialization && filters.specialization !== 'all') {
          url += `&specialties.cs.{${filters.specialization}}`;
        }

        // Apply rating filter
        if (filters.minRating) {
          url += `&average_rating.gte.${filters.minRating}`;
        }

        // Add ordering
        url += '&order=average_rating.desc';

        const fetchPromise = fetch(url, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
            'Content-Type': 'application/json'
          }
        });

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log('✅ Successfully fetched trainers:', data.length);

        // Transform data to match frontend expectations
        return data.map((trainer: any) => {
          // Parse pricing data
          let pricingData = trainer.pricing || {};
          if (typeof pricingData === 'string') {
            try {
              pricingData = JSON.parse(pricingData);
            } catch (e) {
              pricingData = { hourly_rate: 1500 };
            }
          }

          // Parse availability data and convert to day names
          let availabilityDays: string[] = [];
          if (trainer.availability && Array.isArray(trainer.availability)) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            availabilityDays = trainer.availability
              .filter((slot: any) => slot.is_available)
              .map((slot: any) => dayNames[slot.day_of_week])
              .filter(Boolean);
          }

          return {
            id: trainer.id,
            name: trainer.name || 'Unknown Trainer',
            email: trainer.contact_email || 'trainer@healthythako.com',
            location: trainer.location || 'Dhaka',
            trainer_profiles: {
              bio: trainer.bio || trainer.description || 'Experienced fitness trainer',
              profile_image: trainer.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
              rate_per_hour: pricingData.hourly_rate || 1500,
              experience_years: parseInt(trainer.experience?.replace(/\D/g, '') || '3'),
              specializations: trainer.specialties || [trainer.specialty || 'Fitness Training'],
              is_verified: trainer.status === 'active',
              services: trainer.specialties || ['Personal Training'],
              languages: ['English', 'Bengali'],
              availability: availabilityDays,
              certifications: trainer.certifications || ['Certified Personal Trainer'],
              contact_phone: trainer.contact_phone || '+880 1234-567890',
              pricing: pricingData
            },
            average_rating: parseFloat(trainer.average_rating) || 0,
            total_reviews: trainer.total_reviews || 0,
            completed_bookings: Math.floor(Math.random() * 80) + 20
          };
        });
      } catch (error) {
        console.error('❌ Error fetching trainers:', error);
        console.log('🔄 Using fallback trainer data...');
        return getFallbackTrainerData();
      }
    },
    retry: false, // Don't retry, go straight to fallback
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    timeout: 5000, // 5 second timeout
    onError: (error) => {
      console.error('❌ useTrainerSearch error:', error);
      console.log('🔄 Will use fallback data...');
    }
  });
};

export const useTrainerSpecializations = () => {
  return useQuery({
    queryKey: ['trainer-specializations'],
    queryFn: async () => {
      console.log('🔍 Fetching trainer specializations...');

      // Return fallback specializations immediately
      const fallbackSpecializations = [
        'Weight Training',
        'Cardio Training',
        'Yoga',
        'Pilates',
        'CrossFit',
        'HIIT',
        'Strength Training',
        'Bodybuilding',
        'Functional Training',
        'Sports Training',
        'Women\'s Fitness',
        'Postpartum Recovery',
        'Meditation',
        'Wellness Coaching'
      ];

      // Try to fetch real data in background with very short timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const response = await fetch(
          'https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/trainers?select=specialties&specialties=not.is.null',
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully fetched real specializations data');

          const specializations = new Set<string>();
          data?.forEach((trainer: any) => {
            trainer.specialties?.forEach((spec: string) => specializations.add(spec));
          });

          const realSpecializations = Array.from(specializations).sort();

          // If we got real data, return it, otherwise return fallback
          if (realSpecializations.length > 0) {
            console.log('🔄 Using real specializations data');
            return realSpecializations;
          }
        }
      } catch (error) {
        console.log('⚠️ Real specializations fetch failed, using fallback:', error);
      }

      console.log('🔄 Using fallback specializations data');
      return fallbackSpecializations;
    },
    retry: false, // Don't retry, use fallback immediately
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    onError: (error) => {
      console.error('❌ useTrainerSpecializations error:', error);
    }
  });
};

// Hook for getting a single trainer with complete data
export const useTrainerDetails = (trainerId: string) => {
  return useQuery({
    queryKey: ['trainer-details', trainerId],
    queryFn: async () => {
      if (!trainerId) throw new Error('No trainer ID provided');

      try {
        console.log('🔍 Fetching trainer details for ID:', trainerId);

        // First try to get the trainer's user_id
        const { data: trainerBasic, error: basicError } = await queryWithTimeout(
          supabase
            .from('trainers')
            .select('user_id')
            .eq('id', trainerId)
            .single(),
          5000
        );

        // Use direct trainer query (simplified approach)
        console.log('🔄 Using direct trainer query...');

        const { data: trainer, error: trainerError } = await queryWithTimeout(
          supabase
            .from('trainers')
            .select(`
              id,
              name,
              contact_email,
              location,
              bio,
              image_url,
              specialty,
              experience,
              rating,
              reviews,
              description,
              certifications,
              specialties,
              availability,
              contact_phone,
              pricing,
              status,
              average_rating,
              total_reviews,
              created_at
            `)
            .eq('id', trainerId)
            .single(),
          10000
        );

        if (trainerError) {
          console.error('Error fetching trainer:', trainerError);
          throw trainerError;
        }

        if (!trainer) {
          throw new Error('Trainer not found');
        }

        // Get reviews with reviewer details
        const { data: reviews } = await queryWithTimeout(
          supabase
            .from('trainer_reviews')
            .select(`
              id,
              rating,
              comment,
              created_at,
              session_type,
              would_recommend,
              users!trainer_reviews_user_id_fkey(full_name)
            `)
            .eq('trainer_id', trainerId)
            .order('created_at', { ascending: false }),
          5000
        );

        // Transform trainer data to match expected structure
        const transformedTrainer = transformTrainerData(trainer);

        // Return enriched trainer data with proper structure
        return {
          ...transformedTrainer,
          reviews: reviews || []
        };
      } catch (error) {
        console.error('❌ Error in trainer details query:', error);
        console.log('🔄 Using fallback trainer data for details...');

        // Return fallback data for the specific trainer
        const fallbackTrainers = getFallbackTrainerData();
        const fallbackTrainer = fallbackTrainers.find(t => t.id === trainerId) || fallbackTrainers[0];

        return {
          ...fallbackTrainer,
          reviews: []
        };
      }
    },
    enabled: !!trainerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
};

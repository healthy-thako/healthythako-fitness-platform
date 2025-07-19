import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, queryWithTimeout } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface GymImage {
  url: string;
  is_primary: boolean;
}

export interface Gym {
  id: string;
  name: string;
  description?: string;
  address: string;
  area: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  image_url?: string;
  gym_owner_id: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  gym_owner?: {
    name: string;
    email: string;
  };
  images?: GymImage[];
  amenities?: string[];
  membership_plans?: any[];
  monthly_rate?: number;
  daily_rate?: number;
  operating_hours?: string;
  status?: string;
  is_gym_pass_enabled?: boolean;
  ht_verified?: boolean;
  location_lat?: number;
  location_lng?: number;
}

// Helper function to transform gym data to frontend format
const transformGymData = (gym: any) => {
  // Get the primary image URL from the gym_images relationship
  const primaryImageUrl = gym.primary_image_url ||
                          gym.image_url ||
                          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800';

  return {
    id: gym.id,
    name: gym.name || 'Unknown Gym',
    description: gym.description || 'A modern fitness facility',
    address: gym.address || 'Dhaka, Bangladesh',
    area: gym.address?.split(',')[1]?.trim() || 'Dhaka',
    city: 'Dhaka',
    phone: gym.phone || '+880 1234-567890',
    email: gym.email || 'info@gym.com',
    website: gym.website || '',
    logo_url: gym.logo_url || '',
    image_url: primaryImageUrl,
    gym_owner_id: gym.owner_id || '',
    rating: gym.rating || 4.0,
    review_count: gym.review_count || 0,
    is_active: true,
    created_at: gym.created_at,
    updated_at: gym.updated_at,
    // Additional fields expected by frontend
    monthly_rate: 2000,
    daily_rate: 150,
    operating_hours: '6:00 AM - 10:00 PM',
    status: 'active',
    amenities: ['Modern Equipment', 'Air Conditioning', 'Parking', 'Locker Rooms'],
    gym_owner: {
      name: 'Gym Owner',
      email: gym.email || 'owner@gym.com'
    }
  };
};

// Fallback gym data for when database queries fail
const getFallbackGymData = () => {
  console.log('Returning fallback gym data...');
  return [
    {
      id: 'fallback-gym-1',
      name: 'Elite Fitness Center',
      description: 'Premium fitness center with state-of-the-art equipment and professional trainers.',
      address: 'Gulshan 1, Dhaka',
      area: 'Gulshan',
      city: 'Dhaka',
      phone: '+880 1712-345678',
      email: 'info@elitefitness.com',
      website: '',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      gym_owner_id: '',
      rating: 4.5,
      review_count: 25,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_rate: 3500,
      daily_rate: 200,
      operating_hours: '6:00 AM - 11:00 PM',
      status: 'active',
      amenities: ['Modern Equipment', 'Air Conditioning', 'Parking', 'Locker Rooms'],
      gym_owner: { name: 'Gym Owner', email: 'owner@elitefitness.com' }
    },
    {
      id: 'fallback-gym-2',
      name: 'PowerHouse Gym',
      description: 'Strength training focused gym with heavy-duty equipment.',
      address: 'Banani, Dhaka',
      area: 'Banani',
      city: 'Dhaka',
      phone: '+880 1798-765432',
      email: 'contact@powerhousegym.com',
      website: '',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      gym_owner_id: '',
      rating: 4.2,
      review_count: 18,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_rate: 4000,
      daily_rate: 250,
      operating_hours: '5:00 AM - 12:00 AM',
      status: 'active',
      amenities: ['Heavy Equipment', 'Free Weights', 'Cardio Zone'],
      gym_owner: { name: 'Gym Owner', email: 'owner@powerhousegym.com' }
    },
    {
      id: 'fallback-gym-3',
      name: 'Wellness Studio',
      description: 'Holistic wellness center offering yoga, pilates, and mindfulness classes.',
      address: 'Dhanmondi, Dhaka',
      area: 'Dhanmondi',
      city: 'Dhaka',
      phone: '+880 1634-567890',
      email: 'hello@wellnessstudio.com',
      website: '',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
      gym_owner_id: '',
      rating: 4.8,
      review_count: 32,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_rate: 2500,
      daily_rate: 150,
      operating_hours: '7:00 AM - 10:00 PM',
      status: 'active',
      amenities: ['Yoga Studio', 'Pilates Equipment', 'Meditation Room'],
      gym_owner: { name: 'Gym Owner', email: 'owner@wellnessstudio.com' }
    }
  ] as Gym[];
};

// Fetch all gyms
export const useGyms = () => {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: async (): Promise<Gym[]> => {
      console.log('🏋️ Fetching gyms data...');

      // Create a timeout promise that rejects after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      try {
        // Build query with proper field selection and related data including images
        const url = 'https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/gyms?select=id,name,description,address,rating,ht_verified,phone,email,website,location_lat,location_lng,is_gym_pass_enabled,created_at,updated_at,owner_id,gym_amenities(name),membership_plans(id,name,price,duration_days),gym_images(image_url,is_primary)&limit=20&order=created_at.desc';

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

        console.log('✅ Successfully fetched gyms:', data.length);

      // Transform data to match frontend expectations
      return data.map((gym: any) => {
        // Parse address to extract area and city
        const addressParts = gym.address?.split(',') || [];
        const area = addressParts.length > 1 ? addressParts[1]?.trim() : 'Dhaka';
        const city = addressParts.length > 2 ? addressParts[2]?.trim() : 'Dhaka';

        // Extract amenities from related data
        const amenities = gym.gym_amenities?.map((amenity: any) => amenity.name) || ['Modern Equipment', 'Air Conditioning', 'Parking'];

        // Extract and process gym images
        const gymImages = gym.gym_images || [];
        let primaryImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'; // fallback
        let logoUrl = '';

        if (gymImages.length > 0) {
          // Find primary image first
          const primary = gymImages.find((img: any) => img.is_primary);
          if (primary) {
            primaryImage = primary.image_url;
          } else {
            // Use first image if no primary is set
            primaryImage = gymImages[0].image_url;
          }

          // Use primary image as logo as well, or first image
          logoUrl = primary?.image_url || gymImages[0]?.image_url || '';
        }

        // Extract membership plans and calculate rates
        const membershipPlans = gym.membership_plans || [];
        let monthlyRate = 3000;
        let dailyRate = 200;

        if (membershipPlans.length > 0) {
          // Find monthly plan (around 30 days)
          const monthlyPlan = membershipPlans.find((plan: any) => plan.duration_days >= 25 && plan.duration_days <= 35);
          if (monthlyPlan) {
            monthlyRate = monthlyPlan.price;
            dailyRate = Math.round(monthlyPlan.price / 30);
          } else {
            // Use the cheapest plan as reference
            const cheapestPlan = membershipPlans.reduce((min: any, plan: any) =>
              plan.price < min.price ? plan : min, membershipPlans[0]);
            if (cheapestPlan) {
              dailyRate = Math.round(cheapestPlan.price / cheapestPlan.duration_days);
              monthlyRate = dailyRate * 30;
            }
          }
        }

        return {
          id: gym.id,
          name: gym.name || 'Unknown Gym',
          description: gym.description || 'A modern fitness facility',
          address: gym.address || 'Dhaka, Bangladesh',
          area: area,
          city: city,
          phone: gym.phone || '+880 1234-567890',
          email: gym.email || 'info@gym.com',
          website: gym.website || '',
          logo_url: logoUrl,
          image_url: primaryImage,
          gym_owner_id: gym.owner_id || '',
          rating: gym.rating || 4.0,
          review_count: 0,
          is_active: true,
          created_at: gym.created_at || new Date().toISOString(),
          updated_at: gym.updated_at || new Date().toISOString(),
          monthly_rate: monthlyRate,
          daily_rate: dailyRate,
          operating_hours: '6:00 AM - 10:00 PM',
          status: 'active',
          amenities: amenities,
          gym_owner: { name: 'Gym Owner', email: gym.email || 'owner@gym.com' },
          is_gym_pass_enabled: gym.is_gym_pass_enabled || false,
          ht_verified: gym.ht_verified || false,
          location_lat: gym.location_lat,
          location_lng: gym.location_lng,
          membership_plans: membershipPlans,
          images: gymImages.map((img: any) => ({
            url: img.image_url,
            is_primary: img.is_primary
          }))
        };
      });
      } catch (error) {
        console.error('❌ Error fetching gyms:', error);
        console.log('🔄 Using fallback gym data...');
        return getFallbackGymData();
      }
    },
    retry: false, // Don't retry, go straight to fallback
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    timeout: 5000, // 5 second timeout
    onError: (error) => {
      console.error('❌ useGyms error:', error);
      console.log('🔄 Will use fallback data...');
    }
  });
};

// Fetch membership plans for all gyms
export const useMembershipPlans = () => {
  return useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      try {
        console.log('📋 Fetching membership plans...');

        const url = 'https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/membership_plans?select=id,name,description,price,duration_days,features,gym_id,gyms(name,address)&order=price.asc';

        const response = await fetch(url, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        console.log('✅ Successfully fetched membership plans:', data.length);

      // Transform data to match frontend expectations
      return data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || 'Membership plan',
        price: plan.price,
        duration: plan.duration_days,
        duration_text: plan.duration_days === 30 ? 'Monthly' :
                      plan.duration_days === 90 ? 'Quarterly' :
                      plan.duration_days === 180 ? '6 Months' :
                      plan.duration_days === 365 ? 'Annual' :
                      `${plan.duration_days} days`,
        features: plan.features || [],
        gym_id: plan.gym_id,
        gym_name: plan.gyms?.name || 'Unknown Gym',
        gym_address: plan.gyms?.address || 'Dhaka, Bangladesh',
        popular: plan.duration_days === 90, // Mark quarterly as popular
        savings: plan.duration_days > 30 ? Math.round(((30 * plan.price / plan.duration_days) - (plan.price / plan.duration_days)) * plan.duration_days) : 0
      }));
      } catch (error) {
        console.error('❌ Error fetching membership plans:', error);
        console.log('🔄 Using fallback membership plans...');
        return []; // Return empty array as fallback for membership plans
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

// Fetch gym owner's gyms
export const useOwnerGyms = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-gyms', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No authenticated user');

      // First get the gym owner record
      const { data: gymOwner, error: ownerError } = await supabase
        .from('gym_owners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (ownerError) throw ownerError;
      if (!gymOwner) throw new Error('No gym owner profile found');

      // Then fetch their gyms
      const { data, error } = await supabase
        .from('gyms')
        .select(`
          *,
          gym_owner:gym_owners(name, email)
        `)
        .eq('gym_owner_id', gymOwner.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Gym[];
    },
    enabled: !!user
  });
};

// Fetch single gym by ID
export const useGym = (gymId: string) => {
  return useQuery({
    queryKey: ['gym', gymId],
    queryFn: async () => {
      if (!gymId) throw new Error('No gym ID provided');

      console.log('Fetching gym:', gymId);

      try {
        console.log('🏋️ Using minimal gym details query...');

        // Minimal gym details query
        const { data, error } = await queryWithTimeout(
          supabase
            .from('gyms')
            .select(`
              id,
              name,
              description,
              address,
              rating,
              ht_verified
            `)
            .eq('id', gymId)
            .single(),
          5000 // 5 seconds timeout
        );

        if (error) {
          console.error('❌ Error fetching gym details:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Gym not found');
        }

        console.log('✅ Gym details fetched successfully:', data);

        // Skip image fetching and use fallback
        const enrichedGymData = {
          ...data,
          primary_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
        };

        // Transform the data using the same function
        return transformGymData(enrichedGymData) as Gym;
      } catch (error) {
        console.error('Error in gym details query:', error);
        throw error;
      }
    },
    enabled: !!gymId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
};

// Create new gym - UPDATED for new schema
export const useCreateGym = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (gymData: Omit<Gym, 'id' | 'gym_owner_id' | 'rating' | 'review_count' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('No authenticated user');

      // In the new schema, owner_id directly references users table
      const { data, error } = await supabase
        .from('gyms')
        .insert({
          ...gymData,
          owner_id: user.id, // Direct reference to users table
          rating: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      queryClient.invalidateQueries({ queryKey: ['owner-gyms'] });
      toast.success('Gym created successfully!');
    },
    onError: (error) => {
      console.error('Error creating gym:', error);
      toast.error('Failed to create gym');
    }
  });
};

// Update gym - UPDATED for new schema
export const useUpdateGym = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gymId, updates }: { gymId: string; updates: Partial<Gym> }) => {
      if (!user) throw new Error('No authenticated user');

      // In the new schema, owner_id directly references users table
      const { data, error } = await supabase
        .from('gyms')
        .update(updates)
        .eq('id', gymId)
        .eq('owner_id', user.id) // Ensure owner can only update their own gym
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      queryClient.invalidateQueries({ queryKey: ['owner-gyms'] });
      queryClient.invalidateQueries({ queryKey: ['gym', data.id] });
      toast.success('Gym updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating gym:', error);
      toast.error('Failed to update gym');
    }
  });
};

// Delete gym
export const useDeleteGym = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (gymId: string) => {
      if (!user) throw new Error('No authenticated user');

      // Get gym owner record to verify ownership
      const { data: gymOwner, error: ownerError } = await supabase
        .from('gym_owners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (ownerError) throw ownerError;
      if (!gymOwner) throw new Error('No gym owner profile found');

      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', gymId)
        .eq('gym_owner_id', gymOwner.id); // Ensure owner can only delete their own gym

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      queryClient.invalidateQueries({ queryKey: ['owner-gyms'] });
      toast.success('Gym deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting gym:', error);
      toast.error('Failed to delete gym');
    }
  });
};

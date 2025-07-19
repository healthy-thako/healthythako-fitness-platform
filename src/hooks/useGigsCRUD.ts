
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CreateGigData {
  title: string;
  description: string;
  category: string;
  basic_price: number;
  standard_price?: number;
  premium_price?: number;
  basic_description?: string;
  standard_description?: string;
  premium_description?: string;
  basic_delivery_days?: number;
  standard_delivery_days?: number;
  premium_delivery_days?: number;
  tags?: string[];
  requirements?: string;
  images?: string[];
  faq?: Array<{ question: string; answer: string }>;
  status?: 'draft' | 'active' | 'paused';
}

export const useTrainerGigs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-gigs', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useCreateGig = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (gigData: CreateGigData) => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('gigs')
        .insert({
          trainer_id: trainer.id,
          ...gigData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['public-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      toast.success('Service updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Service functionality temporarily disabled: ' + error.message);
    }
  });
};

export const useUpdateGig = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gigId, updates }: { gigId: string; updates: Partial<CreateGigData> }) => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('gigs')
        .update(updates)
        .eq('id', gigId)
        .eq('trainer_id', trainer.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['public-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gigs'] }); // Invalidate search cache
      toast.success('Gig updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update gig: ' + error.message);
    }
  });
};

export const useDeleteGig = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (gigId: string) => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', gigId)
        .eq('trainer_id', trainer.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['public-gigs'] });
      queryClient.invalidateQueries({ queryKey: ['gigs'] }); // Invalidate search cache
      toast.success('Gig deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete gig: ' + error.message);
    }
  });
};

export const usePublicGigs = (filters?: {
  category?: string;
  search?: string;
  priceRange?: { min: number; max: number };
}) => {
  return useQuery({
    queryKey: ['public-gigs', filters],
    queryFn: async () => {
      // DISABLED: Return trainers instead of gigs for now
      // Services are now managed through trainer profiles
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          users!trainers_user_id_fkey(full_name, email)
        `)
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;

      // Transform trainer data to look like gigs for compatibility
      return data?.map(trainer => ({
        id: trainer.id,
        title: `${trainer.specialty} Training`,
        description: trainer.bio || trainer.description,
        category: trainer.specialty,
        basic_price: trainer.pricing?.hourly_rate || 50,
        trainer_profiles: {
          user_id: trainer.user_id,
          profile_image: trainer.image_url,
          experience_years: parseInt(trainer.experience) || 1,
          rate_per_hour: trainer.pricing?.hourly_rate || 50,
          bio: trainer.bio,
          specializations: trainer.specialties,
          languages: ['English']
        },
        profiles: {
          name: trainer.name,
          location: trainer.location
        }
      })) || [];

      // Apply price filtering if needed
      if (filters?.priceRange) {
        return data.filter(item => {
          const price = item.basic_price || 0;
          return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
        });
      }

      return data;
    }
  });
};

export const useGigById = (gigId: string) => {
  return useQuery({
    queryKey: ['gig', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          trainers!gigs_trainer_id_fkey(
            id,
            user_id,
            name,
            image_url,
            bio,
            experience,
            pricing,
            specialties,
            languages,
            users!trainers_user_id_fkey(full_name, email)
          )
        `)
        .eq('id', gigId)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      // Increment view count (temporarily disabled due to type issues)
      // await supabase.rpc('increment_gig_views', { gig_id: gigId });

      return data;
    },
    enabled: !!gigId
  });
};

// Hook for trainers to preview their own gigs (regardless of status)
export const useGigByIdForTrainer = (gigId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-gig-preview', gigId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('id', gigId)
        .eq('trainer_id', trainer.id) // Use correct trainer ID
        .single();

      if (error) throw error;

      // Add mock trainer profile data for preview
      return {
        ...data,
        trainer_profiles: {
          profile_image: null,
          bio: 'Professional trainer',
          experience_years: 5,
          rate_per_hour: 50,
          specializations: ['Fitness'],
          languages: ['English']
        },
        profiles: {
          name: user.user_metadata?.name || 'Trainer',
          location: 'Available Online'
        }
      };
    },
    enabled: !!gigId && !!user
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for gym operations
export interface GymData {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  total_reviews?: number;
  ht_verified?: boolean;
  status?: 'active' | 'inactive' | 'pending';
}

export interface GymImageData {
  image_url: string;
  is_primary?: boolean;
  caption?: string;
}

export interface GymAmenityData {
  amenity_name: string;
  description?: string;
  is_available?: boolean;
}

export interface GymHoursData {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface MembershipPlanData {
  name: string;
  description?: string;
  price: number;
  duration_months: number;
  features?: string[];
  is_active?: boolean;
}

// Hook to get gym profile (for gym owners)
export const useGymProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gym-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });
};

// Hook to create gym profile
export const useCreateGym = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (gymData: GymData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gyms')
        .insert({
          owner_id: user.id,
          ...gymData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-profile'] });
      toast.success('Gym created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create gym: ' + error.message);
    }
  });
};

// Hook to update gym profile
export const useUpdateGym = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<GymData>) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('gyms')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-profile'] });
      toast.success('Gym updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update gym: ' + error.message);
    }
  });
};

// Hook to get gym images
export const useGymImages = (gymId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gym-images', gymId || user?.id],
    queryFn: async () => {
      if (!gymId && !user) throw new Error('No gym ID or user provided');

      let query = supabase
        .from('gym_images')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('created_at');

      if (gymId) {
        query = query.eq('gym_id', gymId);
      } else {
        // Get gym ID for current user
        const { data: gym } = await supabase
          .from('gyms')
          .select('id')
          .eq('owner_id', user!.id)
          .single();

        if (!gym) throw new Error('Gym not found');
        query = query.eq('gym_id', gym.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!(gymId || user)
  });
};

// Hook to upload gym image
export const useUploadGymImage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      file, 
      isPrimary = false, 
      caption 
    }: { 
      file: File; 
      isPrimary?: boolean; 
      caption?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      // Get gym ID
      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!gym) throw new Error('Gym not found');

      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${gym.id}-${Date.now()}.${fileExt}`;
      const filePath = `gym-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gym-images')
        .getPublicUrl(filePath);

      // If this is primary, unset other primary images
      if (isPrimary) {
        await supabase
          .from('gym_images')
          .update({ is_primary: false })
          .eq('gym_id', gym.id);
      }

      // Insert image record
      const { data, error } = await supabase
        .from('gym_images')
        .insert({
          gym_id: gym.id,
          image_url: publicUrl,
          is_primary: isPrimary,
          caption,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-images'] });
      toast.success('Image uploaded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to upload image: ' + error.message);
    }
  });
};

// Hook to delete gym image
export const useDeleteGymImage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (imageId: string) => {
      if (!user) throw new Error('No user authenticated');

      // Get image details first
      const { data: image } = await supabase
        .from('gym_images')
        .select('image_url, gym_id')
        .eq('id', imageId)
        .single();

      if (!image) throw new Error('Image not found');

      // Verify ownership
      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('id', image.gym_id)
        .eq('owner_id', user.id)
        .single();

      if (!gym) throw new Error('Unauthorized');

      // Delete from storage
      const filePath = image.image_url.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('gym-images')
          .remove([`gym-images/${filePath}`]);
      }

      // Delete record
      const { error } = await supabase
        .from('gym_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-images'] });
      toast.success('Image deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete image: ' + error.message);
    }
  });
};

// Hook to get gym amenities
export const useGymAmenities = (gymId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gym-amenities', gymId || user?.id],
    queryFn: async () => {
      if (!gymId && !user) throw new Error('No gym ID or user provided');

      let query = supabase
        .from('gym_amenities')
        .select('*')
        .order('amenity_name');

      if (gymId) {
        query = query.eq('gym_id', gymId);
      } else {
        // Get gym ID for current user
        const { data: gym } = await supabase
          .from('gyms')
          .select('id')
          .eq('owner_id', user!.id)
          .single();

        if (!gym) throw new Error('Gym not found');
        query = query.eq('gym_id', gym.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!(gymId || user)
  });
};

// Hook to update gym amenities
export const useUpdateGymAmenities = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (amenities: GymAmenityData[]) => {
      if (!user) throw new Error('No user authenticated');

      // Get gym ID
      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!gym) throw new Error('Gym not found');

      // Delete existing amenities
      await supabase
        .from('gym_amenities')
        .delete()
        .eq('gym_id', gym.id);

      // Insert new amenities
      const { data, error } = await supabase
        .from('gym_amenities')
        .insert(
          amenities.map(amenity => ({
            gym_id: gym.id,
            ...amenity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-amenities'] });
      toast.success('Amenities updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update amenities: ' + error.message);
    }
  });
};

// Hook to get gym hours
export const useGymHours = (gymId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gym-hours', gymId || user?.id],
    queryFn: async () => {
      if (!gymId && !user) throw new Error('No gym ID or user provided');

      let query = supabase
        .from('gym_hours')
        .select('*')
        .order('day_of_week');

      if (gymId) {
        query = query.eq('gym_id', gymId);
      } else {
        // Get gym ID for current user
        const { data: gym } = await supabase
          .from('gyms')
          .select('id')
          .eq('owner_id', user!.id)
          .single();

        if (!gym) throw new Error('Gym not found');
        query = query.eq('gym_id', gym.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!(gymId || user)
  });
};

// Hook to update gym hours
export const useUpdateGymHours = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (hours: GymHoursData[]) => {
      if (!user) throw new Error('No user authenticated');

      // Get gym ID
      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!gym) throw new Error('Gym not found');

      // Delete existing hours
      await supabase
        .from('gym_hours')
        .delete()
        .eq('gym_id', gym.id);

      // Insert new hours
      const { data, error } = await supabase
        .from('gym_hours')
        .insert(
          hours.map(hour => ({
            gym_id: gym.id,
            ...hour,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-hours'] });
      toast.success('Hours updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update hours: ' + error.message);
    }
  });
};

// Hook to get membership plans
export const useMembershipPlans = (gymId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['membership-plans', gymId || user?.id],
    queryFn: async () => {
      if (!gymId && !user) throw new Error('No gym ID or user provided');

      let query = supabase
        .from('membership_plans')
        .select('*')
        .order('price');

      if (gymId) {
        query = query.eq('gym_id', gymId);
      } else {
        // Get gym ID for current user
        const { data: gym } = await supabase
          .from('gyms')
          .select('id')
          .eq('owner_id', user!.id)
          .single();

        if (!gym) throw new Error('Gym not found');
        query = query.eq('gym_id', gym.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!(gymId || user)
  });
};

// Hook to create membership plan
export const useCreateMembershipPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: MembershipPlanData) => {
      if (!user) throw new Error('No user authenticated');

      // Get gym ID
      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!gym) throw new Error('Gym not found');

      const { data, error } = await supabase
        .from('membership_plans')
        .insert({
          gym_id: gym.id,
          ...planData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create membership plan: ' + error.message);
    }
  });
};

// Hook to update membership plan
export const useUpdateMembershipPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      planId, 
      updates 
    }: { 
      planId: string; 
      updates: Partial<MembershipPlanData>;
    }) => {
      if (!user) throw new Error('No user authenticated');

      // Verify ownership
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('gym_id')
        .eq('id', planId)
        .single();

      if (!plan) throw new Error('Plan not found');

      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('id', plan.gym_id)
        .eq('owner_id', user.id)
        .single();

      if (!gym) throw new Error('Unauthorized');

      const { data, error } = await supabase
        .from('membership_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update membership plan: ' + error.message);
    }
  });
};

// Hook to delete membership plan
export const useDeleteMembershipPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error('No user authenticated');

      // Verify ownership
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('gym_id')
        .eq('id', planId)
        .single();

      if (!plan) throw new Error('Plan not found');

      const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('id', plan.gym_id)
        .eq('owner_id', user.id)
        .single();

      if (!gym) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] });
      toast.success('Membership plan deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete membership plan: ' + error.message);
    }
  });
};

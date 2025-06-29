import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
}

// Fetch all gyms - UPDATED for new schema
export const useGyms = () => {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select(`
          *,
          owner:users!gyms_owner_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Gym[];
    }
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

// Fetch single gym by ID - UPDATED for new schema
export const useGym = (gymId: string) => {
  return useQuery({
    queryKey: ['gym', gymId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select(`
          *,
          owner:users!gyms_owner_id_fkey(full_name, email, phone_number)
        `)
        .eq('id', gymId)
        .single();

      if (error) throw error;
      return data as Gym;
    },
    enabled: !!gymId
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

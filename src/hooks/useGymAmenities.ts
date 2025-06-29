
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GymAmenity {
  id: string;
  gym_id: string;
  name: string;
  description?: string;
  amenity_type: string;
  is_available: boolean;
  created_at: string;
}

export const useGymAmenities = (gymId?: string) => {
  return useQuery({
    queryKey: ['gym-amenities', gymId],
    queryFn: async (): Promise<GymAmenity[]> => {
      if (!gymId) return [];
      
      const { data, error } = await supabase
        .from('gym_amenities')
        .select('*')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching gym amenities:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!gymId,
  });
};

export const useCreateGymAmenities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gymId, amenities }: { gymId: string; amenities: string[] }) => {
      const amenityRecords = amenities
        .filter(amenity => amenity.trim() !== '')
        .map(amenity => ({
          gym_id: gymId,
          name: amenity.trim(),
          amenity_type: 'general'
        }));

      if (amenityRecords.length === 0) return [];

      const { data, error } = await supabase
        .from('gym_amenities')
        .insert(amenityRecords)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-amenities', variables.gymId] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-gyms'] });
    },
    onError: (error: any) => {
      toast.error('Failed to create amenities: ' + error.message);
    },
  });
};

export const useUpdateGymAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GymAmenity> }) => {
      const { data, error } = await supabase
        .from('gym_amenities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gym-amenities', data.gym_id] });
    },
    onError: (error: any) => {
      toast.error('Failed to update amenity: ' + error.message);
    },
  });
};

export const useDeleteGymAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gym_amenities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-amenities'] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete amenity: ' + error.message);
    },
  });
};

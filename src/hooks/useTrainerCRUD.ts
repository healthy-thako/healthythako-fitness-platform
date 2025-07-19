import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for trainer operations
export interface TrainerData {
  name?: string;
  bio?: string;
  experience?: string;
  specialties?: string[];
  certifications?: string[];
  languages?: string[];
  pricing?: {
    hourly_rate?: number;
    session_rate?: number;
    monthly_rate?: number;
  };
  location?: string;
  image_url?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  ht_verified?: boolean;
  rating?: number;
  total_sessions?: number;
  years_experience?: number;
  availability_status?: 'available' | 'busy' | 'offline';
}

export interface TrainerAvailabilityData {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  is_available: boolean;
  timezone?: string;
}

export interface TrainerAvailabilityExceptionData {
  date: string;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  reason?: string;
}

// Hook to get trainer profile
export const useTrainerProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });
};

// Hook to create trainer profile
export const useCreateTrainerProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trainerData: TrainerData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainers')
        .insert({
          user_id: user.id,
          ...trainerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      toast.success('Trainer profile created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create trainer profile: ' + error.message);
    }
  });
};

// Hook to update trainer profile
export const useUpdateTrainerProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<TrainerData>) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-profile'] });
      toast.success('Trainer profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update trainer profile: ' + error.message);
    }
  });
};

// Hook to get trainer availability
export const useTrainerAvailability = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-availability', user?.id],
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
        .from('trainer_availability')
        .select('*')
        .eq('trainer_id', trainer.id)
        .order('day_of_week');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

// Hook to update trainer availability
export const useUpdateTrainerAvailability = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (availabilityData: TrainerAvailabilityData[]) => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      // Delete existing availability
      await supabase
        .from('trainer_availability')
        .delete()
        .eq('trainer_id', trainer.id);

      // Insert new availability
      const { data, error } = await supabase
        .from('trainer_availability')
        .insert(
          availabilityData.map(slot => ({
            trainer_id: trainer.id,
            ...slot,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      toast.success('Availability updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update availability: ' + error.message);
    }
  });
};

// Hook to get trainer availability exceptions
export const useTrainerAvailabilityExceptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-availability-exceptions', user?.id],
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
        .from('trainer_availability_exceptions')
        .select('*')
        .eq('trainer_id', trainer.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

// Hook to create availability exception
export const useCreateAvailabilityException = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exceptionData: TrainerAvailabilityExceptionData) => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { data, error } = await supabase
        .from('trainer_availability_exceptions')
        .insert({
          trainer_id: trainer.id,
          ...exceptionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability-exceptions'] });
      toast.success('Availability exception created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create availability exception: ' + error.message);
    }
  });
};

// Hook to delete availability exception
export const useDeleteAvailabilityException = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exceptionId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('trainer_availability_exceptions')
        .delete()
        .eq('id', exceptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability-exceptions'] });
      toast.success('Availability exception deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete availability exception: ' + error.message);
    }
  });
};

// Hook to get trainer bookings
export const useTrainerBookings = (status?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-bookings', user?.id, status],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      let query = supabase
        .from('trainer_bookings')
        .select(`
          *,
          client:users!trainer_bookings_user_id_fkey(full_name, email, phone_number),
          trainer:trainers!trainer_bookings_trainer_id_fkey(name, contact_email)
        `)
        .eq('trainer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

// Hook to update booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      status, 
      notes 
    }: { 
      bookingId: string; 
      status: string; 
      notes?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) updateData.notes = notes;

      const { data, error } = await supabase
        .from('trainer_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .eq('trainer_user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update booking status: ' + error.message);
    }
  });
};

// Hook to get trainer reviews
export const useTrainerReviews = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-reviews', user?.id],
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
        .from('trainer_reviews')
        .select(`
          *,
          client:users!trainer_reviews_user_id_fkey(full_name)
        `)
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

// Hook to get trainer analytics
export const useTrainerAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      // Get analytics data
      const [bookingsResult, reviewsResult, earningsResult] = await Promise.all([
        supabase
          .from('trainer_bookings')
          .select('status, created_at, total_amount')
          .eq('trainer_id', trainer.id),
        supabase
          .from('trainer_reviews')
          .select('rating, created_at')
          .eq('trainer_id', trainer.id),
        supabase
          .from('trainer_earnings')
          .select('amount, status, created_at')
          .eq('trainer_id', trainer.id)
      ]);

      const bookings = bookingsResult.data || [];
      const reviews = reviewsResult.data || [];
      const earnings = earningsResult.data || [];

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      const totalEarnings = earnings
        .filter(e => e.status === 'completed')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        totalBookings,
        completedBookings,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
        totalEarnings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
      };
    },
    enabled: !!user
  });
};

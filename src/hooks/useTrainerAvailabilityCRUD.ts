import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TrainerAvailabilityData {
  id?: string;
  trainer_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  is_available: boolean;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrainerAvailabilityExceptionData {
  id?: string;
  trainer_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  reason?: string;
  created_at?: string;
  updated_at?: string;
}

// Hook to get trainer's availability schedule
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
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return data as TrainerAvailabilityData[];
    },
    enabled: !!user
  });
};

// Hook to get trainer availability by trainer ID (public)
export const usePublicTrainerAvailability = (trainerId: string) => {
  return useQuery({
    queryKey: ['public-trainer-availability', trainerId],
    queryFn: async () => {
      if (!trainerId) throw new Error('No trainer ID provided');

      const { data, error } = await supabase
        .from('trainer_availability')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('is_available', true)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return data as TrainerAvailabilityData[];
    },
    enabled: !!trainerId
  });
};

// Hook to create/update trainer availability
export const useSetTrainerAvailability = () => {
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

      // Delete existing availability for this trainer
      await supabase
        .from('trainer_availability')
        .delete()
        .eq('trainer_id', trainer.id);

      // Insert new availability data
      const dataToInsert = availabilityData.map(item => ({
        trainer_id: trainer.id,
        day_of_week: item.day_of_week,
        start_time: item.start_time,
        end_time: item.end_time,
        is_available: item.is_available,
        timezone: item.timezone || 'UTC'
      }));

      const { data, error } = await supabase
        .from('trainer_availability')
        .insert(dataToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      queryClient.invalidateQueries({ queryKey: ['public-trainer-availability'] });
      toast.success('Availability updated successfully!');
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
        .order('date', { ascending: true });

      if (error) throw error;
      return data as TrainerAvailabilityExceptionData[];
    },
    enabled: !!user
  });
};

// Hook to create availability exception
export const useCreateAvailabilityException = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exceptionData: Omit<TrainerAvailabilityExceptionData, 'id' | 'trainer_id'>) => {
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
          ...exceptionData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability-exceptions'] });
      toast.success('Availability exception created successfully!');
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

      // Get trainer ID first
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) throw new Error('Trainer profile not found');

      const { error } = await supabase
        .from('trainer_availability_exceptions')
        .delete()
        .eq('id', exceptionId)
        .eq('trainer_id', trainer.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability-exceptions'] });
      toast.success('Availability exception deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete availability exception: ' + error.message);
    }
  });
};

// Hook to check if trainer is available at specific time
export const useCheckTrainerAvailability = () => {
  return useMutation({
    mutationFn: async ({ 
      trainerId, 
      date, 
      startTime, 
      endTime 
    }: { 
      trainerId: string; 
      date: string; 
      startTime: string; 
      endTime: string; 
    }) => {
      const dayOfWeek = new Date(date).getDay();

      // Check regular availability
      const { data: regularAvailability } = await supabase
        .from('trainer_availability')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .lte('start_time', startTime)
        .gte('end_time', endTime);

      // Check for exceptions on this date
      const { data: exceptions } = await supabase
        .from('trainer_availability_exceptions')
        .select('*')
        .eq('trainer_id', trainerId)
        .eq('date', date);

      // Check for existing bookings
      const { data: existingBookings } = await supabase
        .from('trainer_bookings')
        .select('session_time, duration_minutes')
        .eq('trainer_id', trainerId)
        .eq('session_date', date)
        .in('status', ['confirmed', 'pending']);

      return {
        isAvailable: regularAvailability && regularAvailability.length > 0,
        hasExceptions: exceptions && exceptions.length > 0,
        hasConflictingBookings: existingBookings && existingBookings.length > 0,
        exceptions: exceptions || [],
        conflictingBookings: existingBookings || []
      };
    }
  });
};

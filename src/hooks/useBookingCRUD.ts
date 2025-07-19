import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for booking operations
export interface BookingData {
  trainer_id: string;
  trainer_user_id: string;
  session_type: 'personal_training' | 'group_session' | 'consultation' | 'online_session';
  session_date: string;
  session_time: string;
  duration_minutes: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  location?: string;
  special_requirements?: string;
}

export interface SessionData {
  booking_id: string;
  trainer_id: string;
  client_id: string;
  session_type: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  trainer_notes?: string;
  client_feedback?: string;
  rating?: number;
  location?: string;
}

export interface WorkoutSessionData {
  user_id: string;
  workout_plan_id?: string;
  trainer_session_id?: string;
  session_name: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  calories_burned?: number;
  notes?: string;
  exercises_completed?: any[];
  performance_metrics?: any;
}

// Hook to create a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bookingData: BookingData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainer_bookings')
        .insert({
          user_id: user.id,
          ...bookingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      toast.success('Booking created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create booking: ' + error.message);
    }
  });
};

// Hook to get user bookings
export const useUserBookings = (status?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-bookings', user?.id, status],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      let query = supabase
        .from('trainer_bookings')
        .select(`
          *,
          trainer:trainers!trainer_bookings_trainer_id_fkey(name, image_url, contact_email),
          trainer_user:users!trainer_bookings_trainer_user_id_fkey(full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

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
          client:users!trainer_bookings_user_id_fkey(full_name, email, phone_number, avatar_url),
          trainer:trainers!trainer_bookings_trainer_id_fkey(name, contact_email)
        `)
        .eq('trainer_user_id', user.id)
        .order('session_date', { ascending: false });

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
      notes,
      paymentStatus 
    }: { 
      bookingId: string; 
      status: string; 
      notes?: string;
      paymentStatus?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) updateData.notes = notes;
      if (paymentStatus) updateData.payment_status = paymentStatus;

      const { data, error } = await supabase
        .from('trainer_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .or(`user_id.eq.${user.id},trainer_user_id.eq.${user.id}`)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Booking updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update booking: ' + error.message);
    }
  });
};

// Hook to cancel booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      reason 
    }: { 
      bookingId: string; 
      reason?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainer_bookings')
        .update({
          status: 'cancelled',
          notes: reason || 'Cancelled by user',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .or(`user_id.eq.${user.id},trainer_user_id.eq.${user.id}`)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to cancel booking: ' + error.message);
    }
  });
};

// Hook to reschedule booking
export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      newDate, 
      newTime,
      reason 
    }: { 
      bookingId: string; 
      newDate: string;
      newTime: string;
      reason?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainer_bookings')
        .update({
          session_date: newDate,
          session_time: newTime,
          status: 'pending', // Reset to pending for trainer confirmation
          notes: reason || 'Rescheduled by user',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .or(`user_id.eq.${user.id},trainer_user_id.eq.${user.id}`)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('Booking rescheduled successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to reschedule booking: ' + error.message);
    }
  });
};

// Hook to create trainer session
export const useCreateTrainerSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sessionData: SessionData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('trainer_sessions')
        .insert({
          ...sessionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-sessions'] });
      toast.success('Session created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create session: ' + error.message);
    }
  });
};

// Hook to get trainer sessions
export const useTrainerSessions = (status?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trainer-sessions', user?.id, status],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      let query = supabase
        .from('trainer_sessions')
        .select(`
          *,
          booking:trainer_bookings!trainer_sessions_booking_id_fkey(*),
          client:users!trainer_sessions_client_id_fkey(full_name, email, avatar_url)
        `)
        .eq('trainer_id', user.id)
        .order('start_time', { ascending: false });

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

// Hook to update session status
export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      status, 
      trainerNotes,
      endTime 
    }: { 
      sessionId: string; 
      status: string; 
      trainerNotes?: string;
      endTime?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (trainerNotes) updateData.trainer_notes = trainerNotes;
      if (endTime) updateData.end_time = endTime;

      const { data, error } = await supabase
        .from('trainer_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('trainer_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-sessions'] });
      toast.success('Session updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update session: ' + error.message);
    }
  });
};

// Hook to create workout session
export const useCreateWorkoutSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (workoutData: WorkoutSessionData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          ...workoutData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast.success('Workout session logged successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to log workout session: ' + error.message);
    }
  });
};

// Hook to get user workout sessions
export const useWorkoutSessions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workout-sessions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_plan:workout_plans!workout_sessions_workout_plan_id_fkey(name, description),
          trainer_session:trainer_sessions!workout_sessions_trainer_session_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};

// Hook to update workout session
export const useUpdateWorkoutSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      updates 
    }: { 
      sessionId: string; 
      updates: Partial<WorkoutSessionData>;
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast.success('Workout session updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update workout session: ' + error.message);
    }
  });
};

// Hook to delete workout session
export const useDeleteWorkoutSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      toast.success('Workout session deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete workout session: ' + error.message);
    }
  });
};

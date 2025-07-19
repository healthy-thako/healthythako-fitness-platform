import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ExerciseLibraryData {
  id: string;
  name: string;
  description?: string;
  category: string;
  muscle_groups: string[];
  equipment_needed?: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  video_url?: string;
  image_url?: string;
  calories_per_minute?: number;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLogData {
  id: string;
  user_id: string;
  exercise_id: string;
  workout_session_id?: string;
  sets: number;
  reps?: number[];
  weight?: number[];
  duration_seconds?: number;
  distance?: number;
  calories_burned?: number;
  notes?: string;
  performed_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExerciseLogData {
  exercise_id: string;
  workout_session_id?: string;
  sets: number;
  reps?: number[];
  weight?: number[];
  duration_seconds?: number;
  distance?: number;
  calories_burned?: number;
  notes?: string;
  performed_at?: string;
}

// Hook to get exercise library (public exercises)
export const useExerciseLibrary = (filters?: { 
  category?: string; 
  muscle_groups?: string[]; 
  difficulty?: string; 
  equipment?: string[]; 
}) => {
  return useQuery({
    queryKey: ['exercise-library', filters],
    queryFn: async () => {
      let query = supabase
        .from('exercise_library')
        .select('*')
        .eq('is_public', true)
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters?.muscle_groups && filters.muscle_groups.length > 0) {
        query = query.overlaps('muscle_groups', filters.muscle_groups);
      }

      if (filters?.equipment && filters.equipment.length > 0) {
        query = query.overlaps('equipment_needed', filters.equipment);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ExerciseLibraryData[];
    }
  });
};

// Hook to get user's custom exercises
export const useUserCustomExercises = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-custom-exercises', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .eq('created_by', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ExerciseLibraryData[];
    },
    enabled: !!user
  });
};

// Hook to create custom exercise
export const useCreateCustomExercise = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exerciseData: Omit<ExerciseLibraryData, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('exercise_library')
        .insert({
          ...exerciseData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-custom-exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-library'] });
      toast.success('Custom exercise created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create exercise: ' + error.message);
    }
  });
};

// Hook to update custom exercise
export const useUpdateCustomExercise = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      exerciseId, 
      updates 
    }: { 
      exerciseId: string; 
      updates: Partial<ExerciseLibraryData>; 
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('exercise_library')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', exerciseId)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-custom-exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-library'] });
      toast.success('Exercise updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update exercise: ' + error.message);
    }
  });
};

// Hook to delete custom exercise
export const useDeleteCustomExercise = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('exercise_library')
        .delete()
        .eq('id', exerciseId)
        .eq('created_by', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-custom-exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-library'] });
      toast.success('Exercise deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete exercise: ' + error.message);
    }
  });
};

// Hook to get user's exercise logs
export const useExerciseLogs = (filters?: { 
  exercise_id?: string; 
  date_range?: string; 
  workout_session_id?: string; 
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exercise-logs', user?.id, filters],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      let query = supabase
        .from('exercise_logs')
        .select(`
          *,
          exercise:exercise_library(name, category, muscle_groups),
          workout_session:workout_sessions(name, date)
        `)
        .eq('user_id', user.id)
        .order('performed_at', { ascending: false });

      // Apply filters
      if (filters?.exercise_id) {
        query = query.eq('exercise_id', filters.exercise_id);
      }

      if (filters?.workout_session_id) {
        query = query.eq('workout_session_id', filters.workout_session_id);
      }

      if (filters?.date_range) {
        const today = new Date();
        let startDate = new Date();
        
        switch (filters.date_range) {
          case 'today':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            break;
          case 'week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        }
        
        query = query.gte('performed_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ExerciseLogData[];
    },
    enabled: !!user
  });
};

// Hook to create exercise log
export const useCreateExerciseLog = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (logData: CreateExerciseLogData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('exercise_logs')
        .insert({
          user_id: user.id,
          performed_at: logData.performed_at || new Date().toISOString(),
          ...logData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-logs'] });
      toast.success('Exercise logged successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to log exercise: ' + error.message);
    }
  });
};

// Hook to update exercise log
export const useUpdateExerciseLog = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      logId, 
      updates 
    }: { 
      logId: string; 
      updates: Partial<CreateExerciseLogData>; 
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('exercise_logs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', logId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-logs'] });
      toast.success('Exercise log updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update exercise log: ' + error.message);
    }
  });
};

// Hook to delete exercise log
export const useDeleteExerciseLog = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (logId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('exercise_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-logs'] });
      toast.success('Exercise log deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete exercise log: ' + error.message);
    }
  });
};

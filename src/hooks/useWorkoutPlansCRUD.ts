import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WorkoutPlanData {
  id: string;
  user_id: string;
  trainer_id?: string;
  name: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  goals: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkoutPlanData {
  name: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  goals: string[];
  is_public?: boolean;
  trainer_id?: string;
}

export interface WorkoutDayData {
  id: string;
  workout_plan_id: string;
  day_number: number;
  name: string;
  description?: string;
  rest_day: boolean;
}

export interface WorkoutExerciseData {
  id: string;
  workout_day_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  weight?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
}

// Hook to get user's workout plans
export const useWorkoutPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workout-plans', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('workout_plans')
        .select(`
          *,
          trainer:trainers(name, users(full_name)),
          workout_days(
            id,
            day_number,
            name,
            rest_day,
            workout_exercises(
              id,
              exercise_name,
              sets,
              reps,
              order_index
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkoutPlanData[];
    },
    enabled: !!user
  });
};

// Hook to get public workout plans
export const usePublicWorkoutPlans = (filters?: { difficulty?: string; goals?: string[] }) => {
  return useQuery({
    queryKey: ['public-workout-plans', filters],
    queryFn: async () => {
      let query = supabase
        .from('workout_plans')
        .select(`
          *,
          trainer:trainers(name, users(full_name)),
          user:users(full_name)
        `)
        .eq('is_public', true);

      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters?.goals && filters.goals.length > 0) {
        query = query.overlaps('goals', filters.goals);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkoutPlanData[];
    }
  });
};

// Hook to get a specific workout plan with full details
export const useWorkoutPlan = (planId: string) => {
  return useQuery({
    queryKey: ['workout-plan', planId],
    queryFn: async () => {
      if (!planId) throw new Error('No plan ID provided');

      const { data, error } = await supabase
        .from('workout_plans')
        .select(`
          *,
          trainer:trainers(name, users(full_name)),
          user:users(full_name),
          workout_days(
            *,
            workout_exercises(*)
          )
        `)
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!planId
  });
};

// Hook to create a workout plan
export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: CreateWorkoutPlanData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          ...planData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Workout plan created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create workout plan: ' + error.message);
    }
  });
};

// Hook to update a workout plan
export const useUpdateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      planId, 
      updates 
    }: { 
      planId: string; 
      updates: Partial<CreateWorkoutPlanData>; 
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('workout_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['workout-plan'] });
      toast.success('Workout plan updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update workout plan: ' + error.message);
    }
  });
};

// Hook to delete a workout plan
export const useDeleteWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Workout plan deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete workout plan: ' + error.message);
    }
  });
};

// Hook to copy a public workout plan to user's plans
export const useCopyWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error('No user authenticated');

      // Get the original plan with all details
      const { data: originalPlan, error: fetchError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          workout_days(
            *,
            workout_exercises(*)
          )
        `)
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;

      // Create new plan for user
      const { data: newPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          name: `${originalPlan.name} (Copy)`,
          description: originalPlan.description,
          difficulty_level: originalPlan.difficulty_level,
          duration_weeks: originalPlan.duration_weeks,
          goals: originalPlan.goals,
          is_public: false
        })
        .select()
        .single();

      if (planError) throw planError;

      // Copy workout days and exercises
      if (originalPlan.workout_days && originalPlan.workout_days.length > 0) {
        for (const day of originalPlan.workout_days) {
          const { data: newDay, error: dayError } = await supabase
            .from('workout_days')
            .insert({
              workout_plan_id: newPlan.id,
              day_number: day.day_number,
              name: day.name,
              description: day.description,
              rest_day: day.rest_day
            })
            .select()
            .single();

          if (dayError) throw dayError;

          if (day.workout_exercises && day.workout_exercises.length > 0) {
            const exercises = day.workout_exercises.map(exercise => ({
              workout_day_id: newDay.id,
              exercise_name: exercise.exercise_name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              duration_seconds: exercise.duration_seconds,
              rest_seconds: exercise.rest_seconds,
              notes: exercise.notes,
              order_index: exercise.order_index
            }));

            const { error: exerciseError } = await supabase
              .from('workout_exercises')
              .insert(exercises);

            if (exerciseError) throw exerciseError;
          }
        }
      }

      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Workout plan copied to your plans!');
    },
    onError: (error: any) => {
      toast.error('Failed to copy workout plan: ' + error.message);
    }
  });
};

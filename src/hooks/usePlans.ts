
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WorkoutPlan {
  id: string;
  trainer_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  exercises: any[];
  duration_weeks: number;
  difficulty_level: string;
  created_at: string;
  updated_at: string;
}

export interface NutritionPlan {
  id: string;
  trainer_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  daily_calories: number | null;
  macros: any;
  guidelines: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  trainer_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  meals: any[];
  total_calories: number | null;
  plan_type: string;
  created_at: string;
  updated_at: string;
}

// Create input types for mutations
export interface CreateWorkoutPlanInput {
  title: string;
  description?: string;
  exercises?: any[];
  duration_weeks?: number;
  difficulty_level?: string;
  client_id?: string;
}

export interface CreateNutritionPlanInput {
  title: string;
  description?: string;
  daily_calories?: number;
  macros?: any;
  guidelines?: string;
  client_id?: string;
}

export interface CreateMealPlanInput {
  title: string;
  description?: string;
  meals?: any[];
  total_calories?: number;
  plan_type?: string;
  client_id?: string;
}

export const useWorkoutPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workout-plans', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkoutPlan[];
    },
    enabled: !!user
  });
};

export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: CreateWorkoutPlanInput) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          title: planData.title,
          description: planData.description || null,
          exercises: planData.exercises || [],
          duration_weeks: planData.duration_weeks || 1,
          difficulty_level: planData.difficulty_level || 'beginner',
          client_id: planData.client_id || null,
          trainer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      toast.success('Workout plan created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create workout plan: ' + error.message);
    }
  });
};

export const useNutritionPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nutrition-plans', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NutritionPlan[];
    },
    enabled: !!user
  });
};

export const useCreateNutritionPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: CreateNutritionPlanInput) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('nutrition_plans')
        .insert({
          title: planData.title,
          description: planData.description || null,
          daily_calories: planData.daily_calories || null,
          macros: planData.macros || {},
          guidelines: planData.guidelines || null,
          client_id: planData.client_id || null,
          trainer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-plans'] });
      toast.success('Nutrition plan created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create nutrition plan: ' + error.message);
    }
  });
};

export const useMealPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meal-plans', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MealPlan[];
    },
    enabled: !!user
  });
};

export const useCreateMealPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: CreateMealPlanInput) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          title: planData.title,
          description: planData.description || null,
          meals: planData.meals || [],
          total_calories: planData.total_calories || null,
          plan_type: planData.plan_type || 'weekly',
          client_id: planData.client_id || null,
          trainer_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create meal plan: ' + error.message);
    }
  });
};

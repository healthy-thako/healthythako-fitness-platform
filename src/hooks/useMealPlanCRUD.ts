import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MealPlanData {
  id: string;
  user_id: string;
  trainer_id?: string;
  name: string;
  description?: string;
  duration_days: number;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  dietary_restrictions?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlanDayData {
  id: string;
  meal_plan_id: string;
  day_number: number;
  target_calories?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MealPlanMealData {
  id: string;
  meal_plan_day_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  ingredients?: string[];
  instructions?: string[];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  image_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMealPlanData {
  name: string;
  description?: string;
  duration_days: number;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  dietary_restrictions?: string[];
  is_public?: boolean;
  trainer_id?: string;
}

// Hook to get user's meal plans
export const useMealPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meal-plans', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          trainer:trainers(name, users(full_name)),
          meal_plan_days(
            id,
            day_number,
            target_calories,
            meal_plan_meals(
              id,
              meal_type,
              name,
              calories,
              order_index
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MealPlanData[];
    },
    enabled: !!user
  });
};

// Hook to get public meal plans
export const usePublicMealPlans = (filters?: { 
  dietary_restrictions?: string[]; 
  target_calories?: number; 
  duration?: number; 
}) => {
  return useQuery({
    queryKey: ['public-meal-plans', filters],
    queryFn: async () => {
      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          trainer:trainers(name, users(full_name)),
          user:users(full_name)
        `)
        .eq('is_public', true);

      if (filters?.dietary_restrictions && filters.dietary_restrictions.length > 0) {
        query = query.overlaps('dietary_restrictions', filters.dietary_restrictions);
      }

      if (filters?.target_calories) {
        const range = 200; // ±200 calories
        query = query
          .gte('target_calories', filters.target_calories - range)
          .lte('target_calories', filters.target_calories + range);
      }

      if (filters?.duration) {
        query = query.eq('duration_days', filters.duration);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as MealPlanData[];
    }
  });
};

// Hook to get a specific meal plan with full details
export const useMealPlan = (planId: string) => {
  return useQuery({
    queryKey: ['meal-plan', planId],
    queryFn: async () => {
      if (!planId) throw new Error('No plan ID provided');

      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          trainer:trainers(name, users(full_name)),
          user:users(full_name),
          meal_plan_days(
            *,
            meal_plan_meals(*)
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

// Hook to create a meal plan
export const useCreateMealPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planData: CreateMealPlanData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('meal_plans')
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
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan created successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to create meal plan: ' + error.message);
    }
  });
};

// Hook to update a meal plan
export const useUpdateMealPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      planId, 
      updates 
    }: { 
      planId: string; 
      updates: Partial<CreateMealPlanData>; 
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('meal_plans')
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
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Meal plan updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update meal plan: ' + error.message);
    }
  });
};

// Hook to delete a meal plan
export const useDeleteMealPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete meal plan: ' + error.message);
    }
  });
};

// Hook to add a day to meal plan
export const useAddMealPlanDay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      mealPlanId, 
      dayNumber, 
      targetCalories, 
      notes 
    }: { 
      mealPlanId: string; 
      dayNumber: number; 
      targetCalories?: number; 
      notes?: string; 
    }) => {
      const { data, error } = await supabase
        .from('meal_plan_days')
        .insert({
          meal_plan_id: mealPlanId,
          day_number: dayNumber,
          target_calories: targetCalories,
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Day added to meal plan successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to add day to meal plan: ' + error.message);
    }
  });
};

// Hook to add a meal to meal plan day
export const useAddMealPlanMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealData: Omit<MealPlanMealData, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('meal_plan_meals')
        .insert(mealData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Meal added to plan successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to add meal to plan: ' + error.message);
    }
  });
};

// Hook to update meal plan meal
export const useUpdateMealPlanMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      mealId, 
      updates 
    }: { 
      mealId: string; 
      updates: Partial<MealPlanMealData>; 
    }) => {
      const { data, error } = await supabase
        .from('meal_plan_meals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Meal updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to update meal: ' + error.message);
    }
  });
};

// Hook to delete meal plan meal
export const useDeleteMealPlanMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase
        .from('meal_plan_meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan'] });
      toast.success('Meal deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to delete meal: ' + error.message);
    }
  });
};

// Hook to copy a public meal plan to user's plans
export const useCopyMealPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error('No user authenticated');

      // Get the original plan with all details
      const { data: originalPlan, error: fetchError } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_days(
            *,
            meal_plan_meals(*)
          )
        `)
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;

      // Create new plan for user
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          name: `${originalPlan.name} (Copy)`,
          description: originalPlan.description,
          duration_days: originalPlan.duration_days,
          target_calories: originalPlan.target_calories,
          target_protein: originalPlan.target_protein,
          target_carbs: originalPlan.target_carbs,
          target_fat: originalPlan.target_fat,
          dietary_restrictions: originalPlan.dietary_restrictions,
          is_public: false
        })
        .select()
        .single();

      if (planError) throw planError;

      // Copy meal plan days and meals
      if (originalPlan.meal_plan_days && originalPlan.meal_plan_days.length > 0) {
        for (const day of originalPlan.meal_plan_days) {
          const { data: newDay, error: dayError } = await supabase
            .from('meal_plan_days')
            .insert({
              meal_plan_id: newPlan.id,
              day_number: day.day_number,
              target_calories: day.target_calories,
              notes: day.notes
            })
            .select()
            .single();

          if (dayError) throw dayError;

          if (day.meal_plan_meals && day.meal_plan_meals.length > 0) {
            const meals = day.meal_plan_meals.map(meal => ({
              meal_plan_day_id: newDay.id,
              meal_type: meal.meal_type,
              name: meal.name,
              description: meal.description,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
              fiber: meal.fiber,
              sugar: meal.sugar,
              sodium: meal.sodium,
              ingredients: meal.ingredients,
              instructions: meal.instructions,
              prep_time_minutes: meal.prep_time_minutes,
              cook_time_minutes: meal.cook_time_minutes,
              servings: meal.servings,
              image_url: meal.image_url,
              order_index: meal.order_index
            }));

            const { error: mealError } = await supabase
              .from('meal_plan_meals')
              .insert(meals);

            if (mealError) throw mealError;
          }
        }
      }

      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast.success('Meal plan copied to your plans!');
    },
    onError: (error: any) => {
      toast.error('Failed to copy meal plan: ' + error.message);
    }
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AchievementData {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  badge_icon?: string;
  points_earned: number;
  unlocked_at: string;
  progress_data?: any;
}

export interface CreateAchievementData {
  achievement_type: 'workout_streak' | 'weight_loss' | 'muscle_gain' | 'consistency' | 'milestone' | 'social' | 'trainer_rating';
  title: string;
  description: string;
  badge_icon?: string;
  points_earned: number;
  progress_data?: any;
}

// Hook to get user achievements
export const useUserAchievements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data as AchievementData[];
    },
    enabled: !!user
  });
};

// Hook to get user's total achievement points
export const useUserAchievementPoints = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-achievement-points', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_achievements')
        .select('points_earned')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const totalPoints = data?.reduce((sum, achievement) => sum + (achievement.points_earned || 0), 0) || 0;
      return totalPoints;
    },
    enabled: !!user
  });
};

// Hook to get achievements by type
export const useAchievementsByType = (achievementType: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievements-by-type', user?.id, achievementType],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('achievement_type', achievementType)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data as AchievementData[];
    },
    enabled: !!user && !!achievementType
  });
};

// Hook to create/unlock an achievement
export const useUnlockAchievement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (achievementData: CreateAchievementData) => {
      if (!user) throw new Error('No user authenticated');

      // Check if achievement already exists
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_type', achievementData.achievement_type)
        .eq('title', achievementData.title)
        .single();

      if (existing) {
        throw new Error('Achievement already unlocked');
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          ...achievementData,
          unlocked_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievement-points'] });
      toast.success(`🎉 Achievement Unlocked: ${data.title}!`);
    },
    onError: (error: any) => {
      if (!error.message.includes('already unlocked')) {
        toast.error('Failed to unlock achievement: ' + error.message);
      }
    }
  });
};

// Hook to update achievement progress
export const useUpdateAchievementProgress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      achievementId, 
      progressData 
    }: { 
      achievementId: string; 
      progressData: any; 
    }) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .update({ 
          progress_data: progressData,
          updated_at: new Date().toISOString()
        })
        .eq('id', achievementId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    }
  });
};

// Hook to delete an achievement (admin use)
export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (achievementId: string) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('user_achievements')
        .delete()
        .eq('id', achievementId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievement-points'] });
      toast.success('Achievement removed');
    },
    onError: (error: any) => {
      toast.error('Failed to remove achievement: ' + error.message);
    }
  });
};

// Hook to get recent achievements (last 30 days)
export const useRecentAchievements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-achievements', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .gte('unlocked_at', thirtyDaysAgo.toISOString())
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data as AchievementData[];
    },
    enabled: !!user
  });
};

// Hook to check if user can unlock specific achievement
export const useCheckAchievementEligibility = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (achievementType: string) => {
      if (!user) throw new Error('No user authenticated');

      // This would contain logic to check if user meets criteria for specific achievements
      // For now, return basic eligibility check
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_type', achievementType);

      return {
        eligible: true,
        alreadyUnlocked: (existing?.length || 0) > 0,
        criteria: {} // Would contain specific criteria data
      };
    }
  });
};

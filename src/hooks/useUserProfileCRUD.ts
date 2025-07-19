import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types for user profile operations
export interface UserProfileData {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  user_type?: 'client' | 'trainer' | 'gym_owner' | 'admin';
  updated_at?: string;
}

export interface UserProfilesData {
  age?: number;
  gender?: string;
  nationality?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_level?: string;
  fitness_goals?: string[];
  activity_level?: string;
  medical_conditions?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  preferred_workout_days?: number;
  preferred_workout_duration?: number;
  preferred_workout_time?: string;
  date_of_birth?: string;
  location?: string;
  phone?: string;
  preferred_workout_type?: string;
  health_conditions?: string[];
  preferred_trainer_gender?: string;
  profile_completed?: boolean;
  full_name?: string;
  phone_number?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_payment_method?: string;
  checkout_preferences?: any;
}

// Hook to get complete user profile (users + user_profiles)
export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Get both user data and user_profiles data
      const [userResult, profileResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single(),
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      if (userResult.error && userResult.error.code !== 'PGRST116') {
        throw userResult.error;
      }

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        throw profileResult.error;
      }

      return {
        user: userResult.data,
        profile: profileResult.data
      };
    },
    enabled: !!user
  });
};

// Hook to update user basic info (users table)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: UserProfileData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });
};

// Hook to update user profile details (user_profiles table)
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: UserProfilesData) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile details updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile details: ' + error.message);
    }
  });
};

// Hook to upload and update profile image
export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('No user authenticated');

      // Upload image to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user avatar_url
      const { data, error } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile image updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile image: ' + error.message);
    }
  });
};

// Hook to delete user profile (soft delete)
export const useDeleteUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user authenticated');

      // Soft delete by anonymizing user data
      const { data, error } = await supabase
        .from('users')
        .update({
          anonymized: true,
          full_name: 'Deleted User',
          email: `deleted_${user.id}@healthythako.com`,
          phone_number: null,
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete profile: ' + error.message);
    }
  });
};

// Hook to get user preferences
export const useUserPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          preferred_workout_days,
          preferred_workout_duration,
          preferred_workout_time,
          preferred_workout_type,
          preferred_trainer_gender,
          preferred_payment_method,
          checkout_preferences
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });
};

// Hook to update user preferences
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Partial<UserProfilesData>) => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Preferences updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update preferences: ' + error.message);
    }
  });
};

// Hook to get user fitness data
export const useUserFitnessData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-fitness-data', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          height_cm,
          weight_kg,
          fitness_level,
          fitness_goals,
          activity_level,
          medical_conditions,
          allergies,
          dietary_restrictions,
          bmi,
          bmr
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });
};

// Hook to update user fitness data
export const useUpdateUserFitnessData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (fitnessData: Partial<UserProfilesData>) => {
      if (!user) throw new Error('No user authenticated');

      // Calculate BMI if height and weight are provided
      let calculatedData = { ...fitnessData };
      if (fitnessData.height_cm && fitnessData.weight_kg) {
        const heightInMeters = fitnessData.height_cm / 100;
        calculatedData.bmi = Number((fitnessData.weight_kg / (heightInMeters * heightInMeters)).toFixed(1));
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...calculatedData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-fitness-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Fitness data updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update fitness data: ' + error.message);
    }
  });
};

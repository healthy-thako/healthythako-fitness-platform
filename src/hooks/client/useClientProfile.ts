
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useClientProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

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

      if (userResult.error && userResult.error.code !== 'PGRST116') throw userResult.error;
      if (profileResult.error && profileResult.error.code !== 'PGRST116') throw profileResult.error;

      return {
        user: userResult.data,
        profile: profileResult.data
      };
    },
    enabled: !!user
  });
};

export const useUpdateClientProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: any) => {
      if (!user) throw new Error('No user');

      // Map old field names to new schema
      const mappedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) mappedUpdates.full_name = updates.name;
      if (updates.phone) mappedUpdates.phone_number = updates.phone;
      if (updates.email) mappedUpdates.email = updates.email;

      // Handle other fields that might go to user_profiles table
      const userUpdates = { ...mappedUpdates };
      const profileUpdates: any = {};

      if (updates.location) profileUpdates.location = updates.location;
      if (updates.gender) profileUpdates.gender = updates.gender;
      if (updates.date_of_birth) profileUpdates.date_of_birth = updates.date_of_birth;

      // Update users table
      const { data, error } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update user_profiles table if needed
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            ...profileUpdates,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (profileError) console.warn('Profile update warning:', profileError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-profile'] });
    },
  });
};

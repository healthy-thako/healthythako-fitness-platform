import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getAdminHeaders } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface AdminUsersFilters {
  role?: string;
  search?: string;
}

export const useAdminUsers = (filters: AdminUsersFilters = {}) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trainers'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      console.log('Fetching admin users with filters:', filters);
      
      // Use admin-users Edge Function for proper authentication
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: 'getUsers',
          filters: filters
        },
        headers: getAdminHeaders()
      });
      
      if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to fetch users');
      }
      
      console.log('Admin users fetched successfully:', data?.length);
      return data;
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds for admin data
    staleTime: 1000 * 60 * 5 // Consider data stale after 5 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      console.log('Updating user:', userId, updates);

      // Map old field names to new schema
      const mappedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) mappedUpdates.full_name = updates.name;
      if (updates.phone) mappedUpdates.phone_number = updates.phone;
      if (updates.email) mappedUpdates.email = updates.email;
      if (updates.role) mappedUpdates.user_type = updates.role;

      const { data, error } = await supabase
        .from('users')
        .update(mappedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useVerifyTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('Verifying trainer:', userId);
      
      // First check if trainer profile exists, if not create it
      const { data: trainerProfile, error: checkError } = await supabase
        .from('trainer_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking trainer profile:', checkError);
        throw checkError;
      }

      if (!trainerProfile) {
        // Create trainer profile if it doesn't exist
        console.log('Creating trainer profile for user:', userId);
        const { data: newProfile, error: createError } = await supabase
          .from('trainer_profiles')
          .insert({
            user_id: userId,
            is_verified: true
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating trainer profile:', createError);
          throw createError;
        }

        console.log('Trainer profile created and verified:', newProfile);
        return newProfile;
      } else {
        // Update existing trainer profile
        const { data, error } = await supabase
          .from('trainer_profiles')
          .update({ is_verified: true })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) {
          console.error('Error verifying trainer:', error);
          throw error;
        }
        
        console.log('Trainer verified successfully:', data);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('Suspending user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error suspending user:', error);
        throw error;
      }
      
      console.log('User suspended successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trainerData: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      location?: string;
      gender?: string;
      bio?: string;
      specializations?: string[];
      languages?: string[];
      rate_per_hour?: number;
      experience_years?: number;
      profile_image?: string;
    }) => {
      console.log('Creating trainer via edge function:', trainerData);

      // Use edge function to create trainer with proper permissions
      const { data, error } = await supabase.functions.invoke('create-trainer', {
        body: { trainerData }
      });

      if (error) {
        console.error('Error creating trainer:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create trainer');
      }

      console.log('Trainer created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      role: 'client' | 'trainer' | 'gym_owner';
      location?: string;
      gender?: string;
    }) => {
      console.log('Creating user via edge function:', userData);

      // Use edge function to create user with proper authentication
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { userData }
      });

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create user');
      }

      console.log('User created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      
      // First, delete related trainer profile if exists
      const { error: trainerError } = await supabase
        .from('trainer_profiles')
        .delete()
        .eq('user_id', userId);

      if (trainerError) {
        console.warn('Error deleting trainer profile (may not exist):', trainerError);
      }

      // Delete user profile
      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      
      console.log('User deleted successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    }
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminData: {
      username: string;
      email: string;
      password: string;
      role: 'super_admin' | 'admin' | 'moderator';
    }) => {
      console.log('Creating admin user:', adminData);
      
      // Hash password (in production, this should be done server-side)
      const passwordHash = btoa(adminData.password); // Simple encoding for demo
      
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          username: adminData.username,
          email: adminData.email,
          password_hash: passwordHash,
          role: adminData.role,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating admin user:', error);
        throw error;
      }
      
      console.log('Admin user created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
    }
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminUserId: string) => {
      console.log('Deleting admin user:', adminUserId);
      
      const { data, error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminUserId)
        .select()
        .single();
      
      if (error) {
        console.error('Error deleting admin user:', error);
        throw error;
      }
      
      console.log('Admin user deleted successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
    }
  });
};

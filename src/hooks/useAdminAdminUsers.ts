import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to set admin session headers
const setAdminHeaders = () => {
  const sessionToken = localStorage.getItem('admin_session_token');
  if (sessionToken) {
    // Set the header for admin requests
    supabase.realtime.setAuth(sessionToken);
    // Also set custom headers for RLS policies
    (supabase as any).headers = {
      ...((supabase as any).headers || {}),
      'x-admin-session-token': sessionToken
    };
  }
  return sessionToken;
};

export const useAdminAdminUsers = (filters?: { role?: string; search?: string }) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-admin-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_users'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-admin-users', filters],
    queryFn: async () => {
      console.log('Fetching admin users with filters:', filters);
      
      let query = supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      if (filters?.search) {
        query = query.or(`username.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }
      
      console.log('Admin users fetched successfully:', data?.length);
      return data as AdminUser[];
    },
    retry: 2,
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminData: {
      username: string;
      email: string;
      password: string;
      role: 'admin' | 'super_admin';
    }) => {
      console.log('Creating admin user:', adminData.username);
      
      // Hash the password using Web Crypto API (same as in the Edge Function)
      const encoder = new TextEncoder();
      const data = encoder.encode(adminData.password + 'thako_salt_2024');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const { data: newAdmin, error } = await supabase
        .from('admin_users')
        .insert({
          username: adminData.username,
          email: adminData.email,
          password_hash,
          role: adminData.role,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating admin user:', error);
        throw error;
      }
      
      console.log('Admin user created successfully:', newAdmin);
      return newAdmin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admin-users'] });
    }
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adminId, updates }: { 
      adminId: string; 
      updates: Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>
    }) => {
      console.log('Updating admin user:', adminId, updates);
      
      const { data, error } = await supabase
        .from('admin_users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', adminId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating admin user:', error);
        throw error;
      }
      
      console.log('Admin user updated successfully:', data);
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
    mutationFn: async (adminId: string) => {
      console.log('Deleting admin user:', adminId);
      
      const { data, error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)
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

export const useAdminUserStats = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for stats
  useEffect(() => {
    const channel = supabase
      .channel('admin-user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_users'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active');
      
      if (error) throw error;
      
      const stats = {
        total_admins: data.length,
        active_admins: data.filter(u => u.is_active).length,
        inactive_admins: data.filter(u => !u.is_active).length,
        super_admins: data.filter(u => u.role === 'super_admin').length,
        regular_admins: data.filter(u => u.role === 'admin').length
      };
      
      return stats;
    },
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5
  });
};

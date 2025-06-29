import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  description?: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useAdminSettings = () => {
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('system_admin')
  );

  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      console.log('Fetching admin settings');
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'getSettings'
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error fetching admin settings:', error);
        throw new Error(`Failed to fetch admin settings: ${error}`);
      }

      const data = await response.json();
      
      // Convert array of settings to object with proper types
      const settings: { [key: string]: any } = {};
      data.forEach((setting: AdminSetting) => {
        try {
          // Handle JSONB values
          settings[setting.setting_key] = setting.setting_value;
        } catch {
          settings[setting.setting_key] = setting.setting_value;
        }
      });
      
      console.log('Admin settings fetched successfully:', Object.keys(settings).length);
      return { settings, rawData: data };
    },
    retry: 2,
    refetchInterval: 300000, // Refresh every 5 minutes
    enabled: isAuthorized
  });
};

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('system_admin')
  );

  return useMutation({
    mutationFn: async (settings: { [key: string]: any }) => {
      console.log('Updating admin settings:', settings);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'updateSettings',
          settings
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error updating admin settings:', error);
        throw new Error(`Failed to update admin settings: ${error}`);
      }

      const data = await response.json();
      console.log('Admin settings updated successfully:', data.length);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });
};

export const useUpdateSingleSetting = () => {
  const queryClient = useQueryClient();
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('system_admin')
  );

  return useMutation({
    mutationFn: async ({ key, value, category = 'general', description }: { 
      key: string; 
      value: any; 
      category?: string;
      description?: string;
    }) => {
      console.log('Updating single admin setting:', key, value);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'updateSetting',
          key,
          value,
          category,
          description
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error updating admin setting:', error);
        throw new Error(`Failed to update admin setting: ${error}`);
      }

      const data = await response.json();
      console.log('Admin setting updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });
};

export const useCreateSetting = () => {
  const queryClient = useQueryClient();
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('system_admin')
  );

  return useMutation({
    mutationFn: async (setting: {
      setting_key: string;
      setting_value: any;
      category?: string;
      description?: string;
      is_public?: boolean;
    }) => {
      console.log('Creating admin setting:', setting);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'createSetting',
          setting
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error creating admin setting:', error);
        throw new Error(`Failed to create admin setting: ${error}`);
      }

      const data = await response.json();
      console.log('Admin setting created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('system_admin')
  );

  return useMutation({
    mutationFn: async (key: string) => {
      console.log('Deleting admin setting:', key);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'deleteSetting',
          key
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error deleting admin setting:', error);
        throw new Error(`Failed to delete admin setting: ${error}`);
      }

      const data = await response.json();
      console.log('Admin setting deleted successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });
};

// Hook to get settings by category
export const useAdminSettingsByCategory = (category: string) => {
  const { profile, hasPermission } = useAuth();

  // Check if user has admin permissions
  const isAuthorized = profile && (
    profile.primary_role === 'admin' || 
    hasPermission('system_admin')
  );

  return useQuery({
    queryKey: ['admin-settings', 'category', category],
    queryFn: async () => {
      console.log('Fetching admin settings by category:', category);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'getSettingsByCategory',
          category
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error fetching admin settings by category:', error);
        throw new Error(`Failed to fetch admin settings by category: ${error}`);
      }

      const data = await response.json();
      return data;
    },
    retry: 2,
    enabled: isAuthorized
  });
};

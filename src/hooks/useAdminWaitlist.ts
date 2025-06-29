import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  location?: string;
  interested_services?: string[];
  source?: string;
  notes?: string;
  status: 'pending' | 'contacted' | 'converted' | 'declined';
  priority: 'low' | 'medium' | 'high';
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

interface WaitlistStats {
  total_entries: number;
  pending_entries: number;
  contacted_entries: number;
  converted_entries: number;
  declined_entries: number;
  conversion_rate: number;
  entries_this_month: number;
  conversions_this_month: number;
}

export const useAdminWaitlist = () => {
  const { profile } = useAuth();
  const isAuthenticated = profile?.primary_role === 'admin';

  return useQuery({
    queryKey: ['admin-waitlist'],
    queryFn: async () => {
      console.log('Fetching waitlist entries');
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'getEntries'
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error fetching waitlist entries:', error);
        throw new Error(`Failed to fetch waitlist entries: ${error}`);
      }

      const data = await response.json();
      console.log('Waitlist entries fetched successfully:', data.length);
      return data as WaitlistEntry[];
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isAuthenticated
  });
};

export const useWaitlistStats = () => {
  const { profile } = useAuth();
  const isAuthenticated = profile?.primary_role === 'admin';

  return useQuery({
    queryKey: ['admin-waitlist-stats'],
    queryFn: async () => {
      console.log('Fetching waitlist stats');
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'getStats'
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error fetching waitlist stats:', error);
        throw new Error(`Failed to fetch waitlist stats: ${error}`);
      }

      const data = await response.json();
      console.log('Waitlist stats fetched successfully:', data);
      return data as WaitlistStats;
    },
    retry: 2,
    refetchInterval: 60000, // Refresh every minute
    enabled: isAuthenticated
  });
};

export const useCreateWaitlistEntry = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const isAuthenticated = profile?.primary_role === 'admin';

  return useMutation({
    mutationFn: async (entry: Omit<WaitlistEntry, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating waitlist entry:', entry);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'createEntry',
          entryData: entry
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error creating waitlist entry:', error);
        throw new Error(`Failed to create waitlist entry: ${error}`);
      }

      const data = await response.json();
      console.log('Waitlist entry created successfully:', data);
      return data as WaitlistEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist-stats'] });
    }
  });
};

export const useUpdateWaitlistEntry = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const isAuthenticated = profile?.primary_role === 'admin';

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WaitlistEntry> }) => {
      console.log('Updating waitlist entry:', id, updates);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'updateEntry',
          entryId: id,
          entryData: updates
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error updating waitlist entry:', error);
        throw new Error(`Failed to update waitlist entry: ${error}`);
      }

      const data = await response.json();
      console.log('Waitlist entry updated successfully:', data);
      return data as WaitlistEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist-stats'] });
    }
  });
};

export const useDeleteWaitlistEntry = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const isAuthenticated = profile?.primary_role === 'admin';

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting waitlist entry:', id);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'deleteEntry',
          entryId: id
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error deleting waitlist entry:', error);
        throw new Error(`Failed to delete waitlist entry: ${error}`);
      }

      const data = await response.json();
      console.log('Waitlist entry deleted successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist-stats'] });
    }
  });
};

export const useConvertWaitlistEntry = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const isAuthenticated = profile?.primary_role === 'admin';

  return useMutation({
    mutationFn: async ({ id, conversionData }: { 
      id: string; 
      conversionData: {
        notes?: string;
        converted_to?: string;
      }
    }) => {
      console.log('Converting waitlist entry:', id, conversionData);
      
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        throw new Error('No admin session found');
      }

      const response = await fetch('https://gecymswohvloxinrevsr.supabase.co/functions/v1/admin-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          action: 'convertEntry',
          entryId: id,
          entryData: conversionData
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error converting waitlist entry:', error);
        throw new Error(`Failed to convert waitlist entry: ${error}`);
      }

      const data = await response.json();
      console.log('Waitlist entry converted successfully:', data);
      return data as WaitlistEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['admin-waitlist-stats'] });
    }
  });
}; 
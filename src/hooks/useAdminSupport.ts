import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useAdminSupport = (filters?: { status?: string; type?: string; search?: string }) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-support-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-support'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-support', filters],
    queryFn: async () => {
      console.log('Fetching admin support tickets with filters:', filters);
      
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!user_id(name, email),
          assigned_admin:admin_users!assigned_admin_id(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching admin support tickets:', error);
        throw error;
      }
      
      console.log('Admin support tickets fetched successfully:', data?.length);
      return data;
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 1000 * 60 * 5 // Consider data stale after 5 minutes
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData: {
      title: string;
      description: string;
      type: string;
      priority: string;
      user_id?: string;
    }) => {
      console.log('Creating support ticket:', ticketData);
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          title: ticketData.title,
          description: ticketData.description,
          type: ticketData.type,
          priority: ticketData.priority,
          user_id: ticketData.user_id,
          status: 'open'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating support ticket:', error);
        throw error;
      }
      
      console.log('Support ticket created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    }
  });
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, updates }: { 
      ticketId: string; 
      updates: {
        status?: string;
        assigned_admin_id?: string;
        response?: string;
        internal_notes?: string;
        resolved_at?: string;
      };
    }) => {
      console.log('Updating support ticket:', ticketId, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Set resolved_at when closing ticket
      if (updates.status === 'closed' && !updates.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating support ticket:', error);
        throw error;
      }
      
      console.log('Support ticket updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    }
  });
};

export const useDeleteSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      console.log('Deleting support ticket:', ticketId);
      
      const { data, error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting support ticket:', error);
        throw error;
      }
      
      console.log('Support ticket deleted successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    }
  });
};

export const useSupportStats = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for stats
  useEffect(() => {
    const channel = supabase
      .channel('support-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-support-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-support-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status, type, priority, created_at');
      
      if (error) throw error;
      
      const today = new Date().toDateString();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const stats = {
        total_tickets: data.length,
        open_tickets: data.filter(t => t.status === 'open').length,
        in_progress_tickets: data.filter(t => t.status === 'in_progress').length,
        closed_tickets: data.filter(t => t.status === 'closed').length,
        high_priority: data.filter(t => t.priority === 'high').length,
        this_week_tickets: data.filter(t => new Date(t.created_at) > weekAgo).length,
        today_tickets: data.filter(t => new Date(t.created_at).toDateString() === today).length
      };
      
      return stats;
    },
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5
  });
};

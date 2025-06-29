import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useEmailCampaigns = (filters?: { status?: string; search?: string }) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('email-campaigns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_campaigns'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['email-campaigns', filters],
    queryFn: async () => {
      console.log('Fetching email campaigns with filters:', filters);
      
      let query = supabase
        .from('email_campaigns')
        .select(`
          *,
          creator:admin_users(username, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching email campaigns:', error);
        throw error;
      }
      
      console.log('Email campaigns fetched successfully:', data?.length);
      return data || [];
    },
    retry: 2,
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5
  });
};

export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignData: {
      name: string;
      subject: string;
      content: string;
      template_type?: 'newsletter' | 'promotional' | 'announcement' | 'welcome';
      target_audience?: 'all' | 'clients' | 'trainers' | 'gym_owners';
      scheduled_at?: string;
      created_by: string;
    }) => {
      console.log('Creating email campaign:', campaignData);
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaignData,
          status: 'draft'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating email campaign:', error);
        throw error;
      }
      
      console.log('Email campaign created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    }
  });
};

export const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, updates }: { 
      campaignId: string; 
      updates: {
        name?: string;
        subject?: string;
        content?: string;
        template_type?: 'newsletter' | 'promotional' | 'announcement' | 'welcome';
        target_audience?: 'all' | 'clients' | 'trainers' | 'gym_owners';
        status?: 'draft' | 'scheduled' | 'sent' | 'cancelled';
        scheduled_at?: string;
        recipients_count?: number;
        opened_count?: number;
        clicked_count?: number;
      }
    }) => {
      console.log('Updating email campaign:', campaignId, updates);
      
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Set sent_at when status changes to sent
      if (updates.status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating email campaign:', error);
        throw error;
      }
      
      console.log('Email campaign updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    }
  });
};

export const useDeleteEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      console.log('Deleting email campaign:', campaignId);
      
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('Error deleting email campaign:', error);
        throw error;
      }
      
      console.log('Email campaign deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    }
  });
};

export const useEmailStats = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for stats
  useEffect(() => {
    const channel = supabase
      .channel('email-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_campaigns'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['email-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['email-stats'],
    queryFn: async () => {
      console.log('Fetching email stats');
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('status, recipients_count, opened_count, clicked_count');
      
      if (error) throw error;
      
      const campaigns = data || [];
      
      return {
        total_campaigns: campaigns.length,
        draft_campaigns: campaigns.filter(c => c.status === 'draft').length,
        sent_campaigns: campaigns.filter(c => c.status === 'sent').length,
        scheduled_campaigns: campaigns.filter(c => c.status === 'scheduled').length,
        total_recipients: campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0),
        sent_emails: campaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + (c.recipients_count || 0), 0),
        failed_emails: 0, // Will need to track this separately
      };
    },
    retry: 2,
    refetchInterval: 30000,
    staleTime: 1000 * 60 * 5
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type NotificationType = 
  | 'new_booking'
  | 'booking_update'
  | 'payment'
  | 'review'
  | 'gym_verification'
  | 'trainer_verification'
  | 'admin_verification_request'
  | 'withdrawal_update'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user?.id) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Only create channel if it doesn't exist
    if (channelRef.current) {
      return;
    }

    const channelName = `notifications-${user.id}`;

    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {

          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          
          // Show toast notification
          if (payload.new) {
            const notification = payload.new as Notification;
            const icon = getNotificationIcon(notification.type);
            
            toast.info(notification.title, {
              description: notification.message,
              icon: icon
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        console.log('Cleanup: removing notifications channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user
  });
};

// Helper function to get notification icon for toast
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'new_booking':
      return '📅';
    case 'booking_update':
      return '✅';
    case 'payment':
      return '💰';
    case 'review':
      return '⭐';
    case 'gym_verification':
    case 'trainer_verification':
      return '🛡️';
    case 'admin_verification_request':
      return '⚠️';
    default:
      return '📢';
  }
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

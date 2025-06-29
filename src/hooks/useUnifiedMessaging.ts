import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UnifiedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'workout_plan' | 'nutrition_plan' | 'meal_plan';
  booking_id?: string;
  workout_plan_id?: string;
  nutrition_plan_id?: string;
  meal_plan_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
  sender?: {
    name: string;
    email: string;
    role: string;
  };
  receiver?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface UnifiedConversation {
  id: string;
  participant: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useUnifiedConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Set up real-time subscription for conversations
  useEffect(() => {
    if (!user?.id) {
      if (channelRef.current) {
        console.log('Cleaning up conversations channel - no user');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Only create channel if it doesn't exist
    if (channelRef.current) {
      return;
    }

    const channelName = `unified-conversations-${user.id}`;
    console.log('Creating unified conversations channel:', channelName);
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Real-time conversation update:', payload);
          queryClient.invalidateQueries({ queryKey: ['unified-conversations', user.id] });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        console.log('Cleanup: removing unified conversations channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ['unified-conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');

      console.log('Fetching unified conversations for user:', user.id);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, name, email, role),
          receiver:profiles!receiver_id(id, name, email, role)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      console.log('Raw conversation data:', data);

      // Group messages by conversation partner
      const conversationMap = new Map<string, UnifiedConversation>();

      data?.forEach((message: any) => {
        const isFromCurrentUser = message.sender_id === user.id;
        const partnerId = isFromCurrentUser ? message.receiver_id : message.sender_id;
        const partner = isFromCurrentUser ? message.receiver : message.sender;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: partnerId,
            participant: {
              id: partnerId,
              name: partner?.name || 'Unknown User',
              email: partner?.email || '',
              role: partner?.role || 'client'
            },
            lastMessage: message.content,
            lastMessageTime: message.created_at,
            unreadCount: 0
          });
        }

        // Count unread messages (messages sent to current user that are unread)
        if (message.receiver_id === user.id && !message.is_read) {
          const conv = conversationMap.get(partnerId);
          if (conv) {
            conv.unreadCount++;
          }
        }
      });

      const conversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      console.log('Processed conversations:', conversations);
      return conversations;
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute fallback
  });
};

export const useUnifiedMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  // Set up real-time subscription for specific conversation
  useEffect(() => {
    if (!user?.id || !conversationId) {
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

    const channelName = `unified-messages-${conversationId}-${user.id}`;
    console.log('Creating unified messages channel:', channelName);
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('Real-time message update:', payload);
          queryClient.invalidateQueries({ queryKey: ['unified-messages', conversationId, user.id] });
          queryClient.invalidateQueries({ queryKey: ['unified-conversations', user.id] });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        console.log('Cleanup: removing unified messages channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, conversationId, queryClient]);

  return useQuery({
    queryKey: ['unified-messages', conversationId, user?.id],
    queryFn: async () => {
      if (!user || !conversationId) return [];

      console.log('Fetching messages between', user.id, 'and', conversationId);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, name, email, role),
          receiver:profiles!receiver_id(id, name, email, role)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      console.log('Fetched messages:', data);
      return (data || []) as UnifiedMessage[];
    },
    enabled: !!user && !!conversationId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000 // 30 seconds fallback
  });
};

export const useUnifiedSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      receiverId, 
      content, 
      messageType = 'text',
      bookingId,
      workoutPlanId,
      nutritionPlanId,
      mealPlanId
    }: { 
      receiverId: string; 
      content: string; 
      messageType?: 'text' | 'workout_plan' | 'nutrition_plan' | 'meal_plan';
      bookingId?: string;
      workoutPlanId?: string;
      nutritionPlanId?: string;
      mealPlanId?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      console.log('Sending unified message:', {
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: messageType
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          message_type: messageType,
          booking_id: bookingId,
          workout_plan_id: workoutPlanId,
          nutrition_plan_id: nutritionPlanId,
          meal_plan_id: mealPlanId
        })
        .select(`
          *,
          sender:profiles!sender_id(id, name, email, role),
          receiver:profiles!receiver_id(id, name, email, role)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unified-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unified-messages', variables.receiverId] });
      toast.success('Message sent successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message: ' + error.message);
    }
  });
};

export const useUnifiedMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      if (!user) throw new Error('No user authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('receiver_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unified-messages'] });
    },
    onError: (error: any) => {
      console.error('Failed to mark messages as read:', error);
    }
  });
};

export const useUnifiedCreateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      receiverId, 
      initialMessage, 
      bookingId 
    }: { 
      receiverId: string; 
      initialMessage: string; 
      bookingId?: string;
    }) => {
      if (!user) throw new Error('No user authenticated');

      console.log('Creating conversation with initial message:', {
        sender_id: user.id,
        receiver_id: receiverId,
        content: initialMessage
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: initialMessage,
          message_type: 'text',
          booking_id: bookingId
        })
        .select(`
          *,
          sender:profiles!sender_id(id, name, email, role),
          receiver:profiles!receiver_id(id, name, email, role)
        `)
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      console.log('Conversation created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-conversations'] });
      toast.success('Conversation started successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation: ' + error.message);
    }
  });
}; 
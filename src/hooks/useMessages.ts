
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  
  // Set up real-time subscription for messages
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

    const channelName = `messages-conversations-${user.id}`;
    console.log('Creating conversations channel:', channelName);
    
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
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        console.log('Cleanup: removing conversations channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(name, email),
          receiver:profiles!receiver_id(name, email)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group messages by conversation
      const conversations = new Map();
      
      data.forEach(message => {
        const otherId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
        
        if (!conversations.has(otherId)) {
          conversations.set(otherId, {
            id: otherId,
            user: otherUser,
            lastMessage: message,
            unreadCount: 0,
            messages: []
          });
        }
        
        const conversation = conversations.get(otherId);
        conversation.messages.push(message);
        
        if (message.receiver_id === user.id && !message.is_read) {
          conversation.unreadCount++;
        }
      });
      
      return Array.from(conversations.values());
    },
    enabled: !!user
  });
};

export const useConversationMessages = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  
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

    const channelName = `conversation-messages-${conversationId}-${user.id}`;
    
    const channel = supabase.channel(channelName);
    channelRef.current = channel;
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id.eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId, user.id] });
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, conversationId, queryClient]);
  
  return useQuery({
    queryKey: ['conversation-messages', conversationId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      // Get conversation first, then messages
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${conversationId}),and(user1_id.eq.${conversationId},user2_id.eq.${user.id})`)
        .single();

      if (convError) throw convError;
      if (!conversation) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(full_name, email)
        `)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!conversationId
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ receiverId, content, bookingId }: { 
      receiverId: string; 
      content: string; 
      bookingId?: string;
    }) => {
      if (!user) throw new Error('No user');
      
      // First, find or create conversation
      let { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${receiverId}),and(user1_id.eq.${receiverId},user2_id.eq.${user.id})`)
        .single();

      if (convError && convError.code === 'PGRST116') {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            user1_id: user.id,
            user2_id: receiverId
          })
          .select()
          .single();

        if (createError) throw createError;
        conversation = newConv;
      } else if (convError) {
        throw convError;
      }

      // Now send the message
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          message: content
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', variables.receiverId] });
    }
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

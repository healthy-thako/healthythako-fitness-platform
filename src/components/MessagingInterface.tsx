
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Search, User, Clock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import MessageInput from '@/components/MessageInput';
import {
  useUnifiedConversations,
  useUnifiedMessages,
  useUnifiedSendMessage,
  useUnifiedMarkAsRead
} from '@/hooks/useUnifiedMessaging';

interface MessagingInterfaceProps {
  className?: string;
}

const MessagingInterface: React.FC<MessagingInterfaceProps> = ({ className }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { data: conversations = [], isLoading: conversationsLoading } = useUnifiedConversations();
  const { data: messages = [], isLoading: messagesLoading } = useUnifiedMessages(selectedConversation);
  const sendMessage = useUnifiedSendMessage();
  const markAsRead = useUnifiedMarkAsRead();

  // Handle conversation initiation from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.startConversation && state?.trainerId) {
      console.log('Starting conversation with trainer:', state.trainerId);
      setSelectedConversation(state.trainerId);
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.receiver_id === user?.id && !msg.is_read)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead.mutate(unreadMessageIds);
      }
    }
  }, [selectedConversation, messages, user?.id, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user || !content.trim()) return;

    try {
      await sendMessage.mutateAsync({
        receiverId: selectedConversation,
        content: content.trim()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start messaging trainers to see conversations here</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-purple-50 border-purple-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.participant.name}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {conversation.participant.role}
                    </p>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(conversation.lastMessageTime), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedConversationData?.participant.name || 'Unknown User'}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedConversationData?.participant.role || 'User'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.sender_id === user?.id ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {format(new Date(message.created_at), 'HH:mm')}
                        </p>
                        {message.sender_id === user?.id && (
                          <div className="ml-2">
                            {message.is_read ? (
                              <span className="text-xs text-purple-200">✓✓</span>
                            ) : (
                              <span className="text-xs text-purple-300">✓</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <MessageInput
                onSendMessage={handleSendMessage}
                placeholder="Type your message..."
                disabled={sendMessage.isPending}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingInterface;

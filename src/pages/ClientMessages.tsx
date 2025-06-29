
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import MessagingInterface from '@/components/MessagingInterface';

const ClientMessages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SidebarTrigger />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 mesh-gradient-overlay rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs sm:text-sm">💬</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Messages</h1>
              <p className="text-xs text-gray-600 hidden sm:block">Chat with your trainers and receive workout plans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messaging Interface */}
      <div className="p-2 sm:p-3 h-[calc(100vh-55px)] sm:h-[calc(100vh-65px)]">
        <MessagingInterface className="h-full rounded-lg sm:rounded-xl shadow-lg overflow-hidden" />
      </div>
    </div>
  );
};

export default ClientMessages;

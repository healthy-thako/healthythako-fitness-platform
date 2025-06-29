
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import MessagingInterface from '@/components/MessagingInterface';

const TrainerMessages = () => {
  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Messages</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Chat with your clients and send workout, nutrition, and meal plans</p>
          </div>
        </div>
      </div>

      {/* Enhanced Messaging Interface */}
      <div className="p-2 sm:p-3 h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)]">
        <MessagingInterface className="h-full" />
      </div>
    </div>
  );
};

export default TrainerMessages;

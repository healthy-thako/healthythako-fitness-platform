
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import GigManagement from '@/components/GigManagement';

const TrainerGigs = () => {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">My Gigs</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your services and offerings</p>
          </div>
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <GigManagement />
      </div>
    </div>
  );
};

export default TrainerGigs;

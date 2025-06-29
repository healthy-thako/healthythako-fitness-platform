
import React from 'react';
import ClientBookingHistory from '@/components/ClientBookingHistory';
import { SidebarTrigger } from '@/components/ui/sidebar';

const ClientHistory = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Order History</h1>
            <p className="text-xs sm:text-sm text-gray-600">View your past bookings and sessions</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <ClientBookingHistory />
      </div>
    </div>
  );
};

export default ClientHistory;

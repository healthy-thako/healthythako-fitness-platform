import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import AdminOverview from '@/components/AdminOverview';
import AdminUsers from '@/pages/AdminUsers';
import AdminTrainers from '@/pages/AdminTrainers';
import AdminGyms from '@/pages/AdminGyms';
import AdminBookings from '@/pages/AdminBookings';
import AdminTransactions from '@/pages/AdminTransactions';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminBlog from '@/pages/AdminBlog';
import AdminEmail from '@/pages/AdminEmail';
import AdminSupport from '@/pages/AdminSupport';
import AdminSettings from '@/pages/AdminSettings';
import AdminWaitlist from '@/pages/AdminWaitlist';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';

const AdminDashboard = () => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has admin role
  if (!profile || profile.primary_role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('users')) return 'User Management';
    if (path.includes('trainers')) return 'Trainer Management';
    if (path.includes('gyms')) return 'Gym Management';
    if (path.includes('bookings')) return 'Booking Management';
    if (path.includes('transactions')) return 'Transaction Management';
    if (path.includes('analytics')) return 'Analytics & Reports';
    if (path.includes('blog')) return 'Blog Management';
    if (path.includes('email')) return 'Email Campaigns';
    if (path.includes('support')) return 'Support Tickets';
    if (path.includes('settings')) return 'System Settings';
    if (path.includes('waitlist')) return 'Waitlist Management';
    return 'Admin Dashboard';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title={getPageTitle()} />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="trainers" element={<AdminTrainers />} />
              <Route path="gyms" element={<AdminGyms />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="email" element={<AdminEmail />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="waitlist" element={<AdminWaitlist />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;

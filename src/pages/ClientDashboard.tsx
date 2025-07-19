import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';
import ClientOverview from '@/components/ClientOverview';
import ClientSessions from '@/pages/ClientSessions';
import ClientMessages from '@/pages/ClientMessages';
import ClientFavorites from '@/pages/ClientFavorites';
import ClientReviews from '@/pages/ClientReviews';
import ClientHistory from '@/pages/ClientHistory';
import ClientPayments from '@/pages/ClientPayments';
import ClientSettings from '@/pages/ClientSettings';
import ClientMemberships from '@/pages/ClientMemberships';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SignoutTestButton from '@/components/SignoutTestButton';
import RoutingDebugger from '@/components/RoutingDebugger';
import AuthDebugger from '@/components/AuthDebugger';

const ClientDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Use the profile from AuthContext instead of a separate query
  const profileData = profile?.user_profiles || profile?.profile_data;
  const profileLoading = loading;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Simplified profile check - trust that RoleBasedRedirect already handled this
  useEffect(() => {
    console.log('=== CLIENT DASHBOARD LOADED ===', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      hasProfileData: !!profileData,
      profileCompleted: profileData?.profile_completed,
      currentPath: window.location.pathname
    });

    // If we're here, RoleBasedRedirect already verified the profile is complete
    // Just log for debugging
    if (!loading && user && profile) {
      console.log('✅ CLIENT DASHBOARD: User authenticated and profile verified');
    }
  }, [user, loading, profile, profileData]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  console.log('ClientDashboard rendering with path:', window.location.pathname);
  console.log('ClientDashboard user:', user?.id);
  console.log('ClientDashboard profile:', profile);
  console.log('ClientDashboard profileData:', profileData);

  // If we're still loading or redirecting, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user, this shouldn't happen due to protected route, but just in case
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>No user found. Please log in.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <ClientSidebar />
        <main className="flex-1">
          <div className="p-4">
            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <div>Debug: Current path = {window.location.pathname}</div>
              <div>User ID: {user?.id}</div>
              <div>Profile completed: {profileData?.profile_completed ? 'Yes' : 'No'}</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm text-blue-600 mb-4">
              🔍 Route Debug: Rendering routes for path: {window.location.pathname}
            </div>
          </div>
          <Routes>
            <Route index element={
              <div className="p-4">
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  ✅ <strong>ClientOverview Route Working!</strong>
                  <div className="text-sm text-gray-600 mt-2">
                    Path: /client-dashboard (index route)
                  </div>
                </div>
                <ClientOverview />
              </div>
            } />
            <Route path="sessions" element={
              <div className="p-4">
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  ✅ <strong>Sessions Route Working!</strong>
                  <div className="text-sm text-gray-600 mt-2">
                    Path: /client-dashboard/sessions
                  </div>
                </div>
                <ClientSessions />
              </div>
            } />
            <Route path="memberships" element={<ClientMemberships />} />
            <Route path="messages" element={<ClientMessages />} />
            <Route path="favorites" element={<ClientFavorites />} />
            <Route path="reviews" element={<ClientReviews />} />
            <Route path="history" element={<ClientHistory />} />
            <Route path="payments" element={<ClientPayments />} />
            <Route path="settings" element={<ClientSettings />} />
            <Route path="*" element={
              <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  ❌ <strong>Route Not Found</strong>
                  <div className="text-sm text-gray-600 mt-2">
                    Current path: {window.location.pathname}
                  </div>
                  <div className="text-sm text-gray-600">
                    Available routes: /, sessions, memberships, messages, favorites, reviews, history, payments, settings
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>
        {/* Debug components - Only in development with debug logs enabled */}
        {import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true' && (
          <>
            <SignoutTestButton />
            <RoutingDebugger />
            <AuthDebugger />
          </>
        )}
      </div>
    </SidebarProvider>
  );
};

export default ClientDashboard;

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

const ClientDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user profile is complete (updated for new schema)
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check profile completeness and redirect to onboarding if needed
  useEffect(() => {
    if (!loading && !profileLoading && user && profileData) {
      // Check if basic profile is complete (updated for new schema)
      const basicProfileComplete = profileData?.phone_number && profileData?.location;

      if (!basicProfileComplete) {
        console.log('Client profile incomplete, redirecting to onboarding:', {
          basicProfileComplete,
          profile: profileData
        });
        navigate('/onboarding');
        return;
      }
    }
  }, [user, loading, profileData, profileLoading, navigate]);

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <ClientSidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ClientOverview />} />
            <Route path="/sessions" element={<ClientSessions />} />
            <Route path="/memberships" element={<ClientMemberships />} />
            <Route path="/messages" element={<ClientMessages />} />
            <Route path="/favorites" element={<ClientFavorites />} />
            <Route path="/reviews" element={<ClientReviews />} />
            <Route path="/history" element={<ClientHistory />} />
            <Route path="/payments" element={<ClientPayments />} />
            <Route path="/settings" element={<ClientSettings />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ClientDashboard;

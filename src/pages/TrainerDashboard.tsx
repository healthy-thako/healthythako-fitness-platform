import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import TrainerSidebar from '@/components/TrainerSidebar';
import TrainerOverview from '@/components/TrainerOverview';
import TrainerHeader from '@/components/TrainerHeader';
import TrainerFooter from '@/components/TrainerFooter';
import ErrorBoundary from '@/components/ErrorBoundary';
import TrainerGigs from '@/pages/TrainerGigs';
import TrainerOrders from '@/pages/TrainerOrders';
import TrainerMessages from '@/pages/TrainerMessages';
import TrainerAnalytics from '@/pages/TrainerAnalytics';
import TrainerEarnings from '@/pages/TrainerEarnings';
import TrainerSchedule from '@/pages/TrainerSchedule';
import TrainerRequests from '@/pages/TrainerRequests';
import TrainerProfile from '@/pages/TrainerProfile';
import TrainerWithdraw from '@/pages/TrainerWithdraw';
import TrainerSettings from '@/pages/TrainerSettings';
import { SidebarProvider } from '@/components/ui/sidebar';
import TrainerDashboardProfile from '@/pages/TrainerDashboardProfile';
import { useTrainerProfile } from '@/hooks/useTrainerProfileCRUD';

const TrainerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: profileData, isLoading: profileLoading } = useTrainerProfile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check profile completeness and redirect to onboarding if needed
  useEffect(() => {
    if (!loading && !profileLoading && user && profileData) {
      const profile = profileData.profile;
      const trainerProfile = profileData.trainerProfile as any; // Type assertion to avoid type issues

      // Check if profile is marked as complete in user_profiles table
      const profileComplete = profile?.profile_completed === true;

      // If profile is not marked as complete, redirect to onboarding
      if (!profileComplete) {
        console.log('Trainer profile incomplete, redirecting to onboarding:', {
          profileComplete,
          profile_completed: profile?.profile_completed,
          profile: profile,
          trainerProfile: trainerProfile
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
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <TrainerSidebar />
          <div className="flex-1 flex flex-col">
            <TrainerHeader />
            <main className="flex-1">
              <ErrorBoundary>
                <Routes>
                  <Route index element={<TrainerOverview />} />
                  <Route path="gigs" element={<TrainerGigs />} />
                  <Route path="orders" element={<TrainerOrders />} />
                  <Route path="messages" element={<TrainerMessages />} />
                  <Route path="analytics" element={<TrainerAnalytics />} />
                  <Route path="earnings" element={<TrainerEarnings />} />
                  <Route path="schedule" element={<TrainerSchedule />} />
                  <Route path="requests" element={<TrainerRequests />} />
                  <Route path="profile" element={<TrainerDashboardProfile />} />
                  <Route path="withdraw" element={<TrainerWithdraw />} />
                  <Route path="settings" element={<TrainerSettings />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <TrainerFooter />
          </div>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default TrainerDashboard;

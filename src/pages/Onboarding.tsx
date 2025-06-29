
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ClientOnboardingWizard from '@/components/onboarding/ClientOnboardingWizard';
import TrainerOnboardingWizard from '@/components/onboarding/TrainerOnboardingWizard';

const Onboarding = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userRole = user.user_metadata?.role;

  if (userRole === 'client') {
    return <ClientOnboardingWizard />;
  } else if (userRole === 'trainer') {
    return <TrainerOnboardingWizard />;
  }

  // If no role, redirect to auth
  return <Navigate to="/auth" replace />;
};

export default Onboarding;


import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ClientOnboardingWizard from '@/components/onboarding/ClientOnboardingWizard';
import TrainerOnboardingWizard from '@/components/onboarding/TrainerOnboardingWizard';

const Onboarding = () => {
  const { user, profile, loading } = useAuth();

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

  // Get role from profile first, then fallback to user metadata
  const userRole = profile?.primary_role || user.user_metadata?.role;

  console.log('Onboarding: User role detected as:', userRole);
  console.log('Onboarding: User metadata:', user.user_metadata);
  console.log('Onboarding: Profile:', profile);

  if (userRole === 'client') {
    return <ClientOnboardingWizard />;
  } else if (userRole === 'trainer') {
    return <TrainerOnboardingWizard />;
  } else if (userRole === 'gym_owner') {
    // Gym owners don't need onboarding, redirect to dashboard
    return <Navigate to="/gym-dashboard" replace />;
  }

  // If no role, default to client onboarding
  console.log('Onboarding: No role found, defaulting to client onboarding');
  return <ClientOnboardingWizard />;
};

export default Onboarding;

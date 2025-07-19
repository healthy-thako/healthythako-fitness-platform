import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const RoleBasedRedirect: React.FC = () => {
  const { user, profile, loading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('RoleBasedRedirect: Effect triggered', { loading, user: !!user, profile: !!profile });

    if (!loading && user && profile) {
      const role = profile.primary_role;

      console.log('RoleBasedRedirect: User role detected as:', role);
      console.log('RoleBasedRedirect: Full profile:', profile);
      console.log('RoleBasedRedirect: User ID:', user.id);

      // Check if user has completed onboarding by checking profile_completed flag
      const userProfileData = profile.user_profiles || profile.profile_data;
      const hasCompletedOnboarding = userProfileData?.profile_completed === true ||
        (role === 'admin'); // Admin doesn't need onboarding

      console.log('✅ PROFILE COMPLETION CHECK:', {
        hasCompletedOnboarding,
        hasProfileData: !!userProfileData,
        profileCompletedValue: userProfileData?.profile_completed,
        role
      });

      // If user hasn't completed onboarding, redirect to onboarding
      if (!hasCompletedOnboarding && role !== 'admin') {
        console.log('RoleBasedRedirect: User needs to complete onboarding');
        navigate('/onboarding', { replace: true });
        return;
      }

      // Redirect based on role
      if (role === 'trainer') {
        navigate('/trainer-dashboard', { replace: true });
      } else if (role === 'client') {
        navigate('/client-dashboard', { replace: true });
      } else if (role === 'gym_owner') {
        navigate('/gym-dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        console.log('RoleBasedRedirect: No valid role found, redirecting to onboarding');
        // If no valid role is set, redirect to onboarding
        navigate('/onboarding', { replace: true });
      }
    } else if (!loading && user && !profile) {
      console.log('RoleBasedRedirect: User found but no profile, redirecting to onboarding');
      // If user exists but no profile, redirect to onboarding
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Temporary debug section for role mapping issues
  if (user && profile && profile.primary_role === 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-600">Role Mapping Issue Detected</h2>
          <p className="text-gray-600">
            Your account has an invalid role: "{profile.primary_role}".
            This should be "client" instead.
          </p>
          <button
            onClick={async () => {
              console.log('Refreshing user profile to fix role mapping...');
              await refreshUserProfile();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fix Role Mapping
          </button>
          <p className="text-sm text-gray-500">
            If this doesn't work, please log out and log back in.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default RoleBasedRedirect;

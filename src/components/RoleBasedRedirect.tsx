import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const RoleBasedRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      const role = profile.primary_role;
      
      console.log('RoleBasedRedirect: User role detected as:', role);
      
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

  return null;
};

export default RoleBasedRedirect;

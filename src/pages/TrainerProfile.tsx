import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TrainerProfileCard from '@/components/TrainerProfileCard';

const TrainerProfile = () => {
  const { trainerId } = useParams();
  const { user } = useAuth();
  
  // If authenticated trainer is viewing their own profile, redirect to dashboard profile
  if (user && user.id === trainerId && user.user_metadata?.role === 'trainer') {
    return <Navigate to="/trainer-dashboard/profile" replace />;
  }
  
  // For public trainer profiles, redirect to the public trainer profile page
  if (trainerId) {
    return <Navigate to={`/trainer/${trainerId}`} replace />;
  }
  
  // If no trainerId, redirect to find trainers page
  return <Navigate to="/find-trainers" replace />;
};

export default TrainerProfile;

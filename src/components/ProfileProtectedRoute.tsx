import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BrandLoadingSpinner from '@/components/BrandLoadingSpinner';
import { toast } from 'sonner';

interface ProfileProtectedRouteProps {
  children: React.ReactNode;
  type: 'trainer' | 'gym';
}

const ProfileProtectedRoute: React.FC<ProfileProtectedRouteProps> = ({ 
  children, 
  type 
}) => {
  const params = useParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const profileId = type === 'trainer' ? params.trainerId : params.gymId;

  useEffect(() => {
    const validateProfile = async () => {
      if (!profileId) {
        console.log('No profile ID provided');
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        if (type === 'trainer') {
          // Check if trainer exists in profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, role')
            .eq('id', profileId)
            .eq('role', 'trainer')
            .single();

          if (profileError || !profile) {
            console.log('Trainer profile not found:', profileError);
            setIsValid(false);
          } else {
            // Check if trainer has a trainer_profile
            const { data: trainerProfile, error: trainerError } = await supabase
              .from('trainer_profiles')
              .select('user_id')
              .eq('user_id', profileId)
              .single();

            if (trainerError || !trainerProfile) {
              console.log('Trainer profile data not found:', trainerError);
              setIsValid(false);
            } else {
              setIsValid(true);
            }
          }
        } else {
          // For gyms, check if gym exists and is active
          const { data: gym, error } = await supabase
            .from('gyms')
            .select('id, name, is_active')
            .eq('id', profileId)
            .single();

          if (error || !gym) {
            console.log('Gym not found:', error);
            setIsValid(false);
          } else if (!gym.is_active) {
            console.log('Gym is not active');
            setIsValid(false);
          } else {
            setIsValid(true);
          }
        }
      } catch (error) {
        console.error(`${type} profile validation error:`, error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateProfile();
  }, [profileId, type]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <BrandLoadingSpinner size="lg" showText={true} />
      </div>
    );
  }

  if (!isValid) {
    // Show error message but don't toast it multiple times
    console.log(`${type} profile validation failed for ID: ${profileId}`);
    return <Navigate to={type === 'trainer' ? "/find-trainers" : "/gym-membership"} replace />;
  }

  return <>{children}</>;
};

export default ProfileProtectedRoute;

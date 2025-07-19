import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { supabase, queryWithTimeout } from '@/integrations/supabase/client';
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
      console.log(`🔍 ProfileProtectedRoute: Validating ${type} profile with ID:`, profileId);

      if (!profileId) {
        console.log('❌ No profile ID provided');
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      // Allow fallback IDs to bypass validation
      if (profileId.startsWith('fallback-')) {
        console.log('✅ Fallback ID detected, allowing access:', profileId);
        setIsValid(true);
        setIsValidating(false);
        return;
      }

      try {
        if (type === 'trainer') {
          // Check if trainer exists using the enhanced function or direct table lookup
          // First try to find trainer by ID (could be trainer record ID or user ID)
          let trainerExists = false;

          // Try as trainer record ID first with timeout
          const { data: trainerRecord } = await queryWithTimeout(
            supabase
              .from('trainers')
              .select('id, user_id, name, status')
              .eq('id', profileId)
              .single(),
            8000, // 8 second timeout
            1 // 1 retry
          );

          if (trainerRecord) {
            trainerExists = true;
          } else {
            // Try as user ID with timeout
            const { data: trainerByUserId } = await queryWithTimeout(
              supabase
                .from('trainers')
                .select('id, user_id, name, status')
                .eq('user_id', profileId)
                .single(),
              8000, // 8 second timeout
              1 // 1 retry
            );

            if (trainerByUserId) {
              trainerExists = true;
            }
          }

          if (!trainerExists) {
            console.log('❌ Trainer not found for ID:', profileId);
            setIsValid(false);
          } else {
            console.log('✅ Trainer found for ID:', profileId);
            setIsValid(true);
          }
        } else {
          // For gyms, check if gym exists with timeout
          const { data: gym, error } = await queryWithTimeout(
            supabase
              .from('gyms')
              .select('id, name')
              .eq('id', profileId)
              .single(),
            8000, // 8 second timeout
            1 // 1 retry
          );

          if (error || !gym) {
            console.log('❌ Gym not found:', error);
            setIsValid(false);
          } else {
            console.log('✅ Gym found for ID:', profileId);
            setIsValid(true);
          }
        }
      } catch (error) {
        console.error(`❌ ${type} profile validation error:`, error);
        console.error(`❌ Error details:`, {
          message: error.message,
          code: error.code,
          details: error.details
        });
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
    console.log(`❌ ${type} profile validation failed for ID: ${profileId}`);
    console.log(`🔄 Redirecting to ${type === 'trainer' ? "/find-trainers" : "/gym-membership"}`);

    // Add a toast notification so user knows what happened
    if (import.meta.env.DEV) {
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} not found: ${profileId}`);
    }

    return <Navigate to={type === 'trainer' ? "/find-trainers" : "/gym-membership"} replace />;
  }

  return <>{children}</>;
};

export default ProfileProtectedRoute;

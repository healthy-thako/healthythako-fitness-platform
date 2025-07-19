import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ClientOnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    date_of_birth: '',
    location: '',
    fitness_goals: '',
    activity_level: '',
    preferred_workout_type: '',
    health_conditions: '',
    preferred_trainer_gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Pre-populate form data if user already has profile information
  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!user) return;

      try {
        // Fetch basic profile from users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch user_profiles data
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userData || userProfile) {
          setFormData(prev => ({
            ...prev,
            phone: userData?.phone_number || userProfile?.phone_number || userProfile?.phone || '',
            gender: userProfile?.gender || '',
            date_of_birth: userProfile?.date_of_birth || '',
            location: userProfile?.location || '',
            fitness_goals: userProfile?.fitness_goals?.join(', ') || '',
            activity_level: userProfile?.activity_level || '',
            preferred_workout_type: userProfile?.preferred_workout_type || '',
            health_conditions: userProfile?.health_conditions?.join(', ') || userProfile?.medical_conditions?.join(', ') || '',
            preferred_trainer_gender: userProfile?.preferred_trainer_gender || ''
          }));

          console.log('Pre-populated client onboarding form with existing data:', { userData, userProfile });
        }
      } catch (error) {
        console.error('Error fetching existing profile data:', error);
      }
    };

    fetchExistingProfile();
  }, [user]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      console.log('Starting profile creation for user:', user.id);

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('user_id, profile_completed')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      console.log('Existing profile check:', existingProfile);

      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          phone_number: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update user_profiles table with proper field mapping
      // Use upsert with explicit conflict resolution on user_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          phone_number: formData.phone,
          phone: formData.phone, // Keep both for compatibility
          gender: formData.gender,
          date_of_birth: formData.date_of_birth || null,
          location: formData.location,
          fitness_goals: formData.fitness_goals ? formData.fitness_goals.split(',').map(g => g.trim()).filter(g => g) : [],
          activity_level: formData.activity_level,
          preferred_workout_type: formData.preferred_workout_type,
          health_conditions: formData.health_conditions ? formData.health_conditions.split(',').map(h => h.trim()).filter(h => h) : [],
          medical_conditions: formData.health_conditions ? formData.health_conditions.split(',').map(h => h.trim()).filter(h => h) : [], // Keep both for compatibility
          preferred_trainer_gender: formData.preferred_trainer_gender,
          profile_completed: true, // Mark profile as completed
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Profile creation successful');

      // Show success message first
      toast.success("Welcome to HealthyThako! Your profile has been set up successfully.");

      // Refresh the user profile in AuthContext to reflect the completed state
      console.log('Refreshing user profile...');
      await refreshUserProfile();

      // Add a longer delay to ensure the profile state is fully updated
      console.log('Waiting for profile state to update...');
      setTimeout(async () => {
        // Double-check that the profile is actually completed before navigating
        const { data: verifyProfile } = await supabase
          .from('user_profiles')
          .select('profile_completed')
          .eq('user_id', user.id)
          .single();

        console.log('Profile verification before navigation:', verifyProfile);

        if (verifyProfile?.profile_completed) {
          console.log('Profile confirmed as complete, navigating to client dashboard...');
          navigate('/client-dashboard', { replace: true });
        } else {
          console.error('Profile still not marked as complete, staying on onboarding');
          toast.error('Profile completion verification failed. Please try again.');
        }
      }, 3000);
    } catch (error: any) {
      console.error('Complete profile creation error:', error);

      // Provide specific error messages
      if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        toast.error("Profile already exists. Redirecting to dashboard...");
        // If profile already exists, just redirect to dashboard
        setTimeout(() => navigate('/client-dashboard'), 1500);
      } else if (error.message?.includes('activity_level')) {
        toast.error("Please select a valid activity level.");
      } else if (error.message?.includes('gender')) {
        toast.error("Please select a valid gender option.");
      } else {
        toast.error("Setup failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Fitness Goals</h3>
              <p className="text-gray-600">Tell us about your fitness journey</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fitness_goals">Primary Fitness Goal</Label>
              <Select value={formData.fitness_goals} onValueChange={(value) => setFormData({ ...formData, fitness_goals: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="What's your main goal?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="endurance">Build Endurance</SelectItem>
                  <SelectItem value="flexibility">Improve Flexibility</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_level">Current Activity Level</Label>
              <Select value={formData.activity_level} onValueChange={(value) => setFormData({ ...formData, activity_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="How active are you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="extremely_active">Extremely Active (2x/day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workout_type">Preferred Workout Type</Label>
              <Select value={formData.preferred_workout_type} onValueChange={(value) => setFormData({ ...formData, preferred_workout_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="What type of workouts do you prefer?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="strength">Strength Training</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="pilates">Pilates</SelectItem>
                  <SelectItem value="mixed">Mixed Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Preferences</h3>
              <p className="text-gray-600">Help us find the perfect trainer for you</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="health_conditions">Health Conditions (Optional)</Label>
              <Input
                id="health_conditions"
                type="text"
                placeholder="Any health conditions we should know about?"
                value={formData.health_conditions}
                onChange={(e) => setFormData({ ...formData, health_conditions: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainer_gender">Preferred Trainer Gender</Label>
              <Select value={formData.preferred_trainer_gender} onValueChange={(value) => setFormData({ ...formData, preferred_trainer_gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Any preference?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_preference">No Preference</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">✓</span>
              </div>
              <p className="text-gray-600">You're all set! Ready to find your perfect trainer?</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to HealthyThako!</CardTitle>
          <CardDescription>
            Let's set up your client profile
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Step {step} of {totalSteps}</p>
          </div>
        </CardHeader>

        <CardContent>
          {renderStep()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              {step < totalSteps ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isLoading}>
                  {isLoading ? 'Completing...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOnboardingWizard;

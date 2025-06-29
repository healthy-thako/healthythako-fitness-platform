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

  const { user } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Pre-populate form data if user already has profile information
  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!user) return;

      try {
        // Fetch basic profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            phone: profile.phone || '',
            gender: profile.gender || '',
            date_of_birth: profile.date_of_birth || '',
            location: profile.location || ''
          }));

          console.log('Pre-populated client onboarding form with existing data:', profile);
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
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          location: formData.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Welcome to HealthyThako! Your profile has been set up successfully.");
      navigate('/client-dashboard');
    } catch (error: any) {
      toast.error("Setup failed: " + error.message);
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
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (2x/day)</SelectItem>
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

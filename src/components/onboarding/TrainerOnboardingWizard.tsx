import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ProfileImageUpload from '@/components/ProfileImageUpload';

const TrainerOnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    date_of_birth: '',
    location: '',
    country: '',
    bio: '',
    experience_years: '',
    rate_per_hour: '',
    specializations: [] as string[],
    languages: [] as string[],
    certifications: [] as string[],
    profile_image: ''
  });
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [currentCertification, setCurrentCertification] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 5;
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

        // Fetch trainer profile using type assertion to avoid type issues
        const { data: trainerProfile } = await supabase
          .from('trainer_profiles' as any)
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile || trainerProfile) {
          const locationParts = profile?.location ? profile.location.split(', ') : ['', ''];
          
          setFormData({
            phone: profile?.phone || '',
            gender: profile?.gender || '',
            date_of_birth: profile?.date_of_birth || '',
            location: locationParts[0] || '',
            country: locationParts[1] || '',
            bio: (trainerProfile as any)?.bio || '',
            experience_years: (trainerProfile as any)?.experience_years?.toString() || '',
            rate_per_hour: (trainerProfile as any)?.rate_per_hour?.toString() || '',
            specializations: (trainerProfile as any)?.specializations || [],
            languages: (trainerProfile as any)?.languages || [],
            certifications: (trainerProfile as any)?.certifications?.map((cert: any) => cert.name || cert) || [],
            profile_image: (trainerProfile as any)?.profile_image || ''
          });

          console.log('Pre-populated trainer onboarding form with existing data:', {
            profile,
            trainerProfile
          });
        }
      } catch (error) {
        console.error('Error fetching existing profile data:', error);
      }
    };

    fetchExistingProfile();
  }, [user]);

  const specializationOptions = [
    'Weight Loss', 'Muscle Gain', 'Strength Training', 'Cardio', 'HIIT',
    'Yoga', 'Pilates', 'CrossFit', 'Bodybuilding', 'Powerlifting',
    'Sports Conditioning', 'Rehabilitation', 'Senior Fitness', 'Youth Fitness',
    'Nutrition Coaching', 'Functional Training', 'Flexibility Training'
  ];

  const languageOptions = [
    'English', 'Bangla', 'Hindi', 'Urdu', 'Arabic', 'Spanish', 'French'
  ];

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
    'Bolivia', 'Brazil', 'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China',
    'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt',
    'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana',
    'Greece', 'Guatemala', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
    'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan',
    'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
    'Malaysia', 'Mexico', 'Morocco', 'Nepal', 'Netherlands', 'New Zealand',
    'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore',
    'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka',
    'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'UAE', 'Ukraine',
    'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam'
  ];

  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, specialization]
      });
    } else {
      setFormData({
        ...formData,
        specializations: formData.specializations.filter(s => s !== specialization)
      });
    }
  };

  const addToArray = (field: keyof typeof formData, value: string, setterFn: Function) => {
    if (value && !(formData[field] as string[]).includes(value)) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), value]
      });
      setterFn('');
    }
  };

  const removeFromArray = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: (formData[field] as string[]).filter(item => item !== value)
    });
  };

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

  const handleImageUploaded = (imageUrl: string) => {
    setFormData({
      ...formData,
      profile_image: imageUrl
    });
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          location: `${formData.location}, ${formData.country}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update trainers table with new schema
      const { error: trainerError } = await supabase
        .from('trainers')
        .upsert({
          user_id: user.id,
          name: user.user_metadata?.name || 'Trainer',
          bio: formData.bio,
          experience: formData.experience_years,
          pricing: {
            hourly_rate: parseFloat(formData.rate_per_hour)
          },
          specialties: formData.specializations,
          certifications: formData.certifications,
          image_url: formData.profile_image,
          updated_at: new Date().toISOString()
        });

      if (trainerError) throw trainerError;

      toast.success("Welcome to HealthyThako! Your trainer profile has been set up successfully.");
      navigate('/trainer-dashboard');
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
              <h3 className="text-xl font-semibold">Profile Photo</h3>
              <p className="text-gray-600">Upload a professional profile photo</p>
            </div>

            <ProfileImageUpload
              currentImage={formData.profile_image}
              onImageUploaded={handleImageUploaded}
              className="mb-6"
            />

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
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
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Location Details</h3>
              <p className="text-gray-600">Where are you based?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">City/Area *</Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Dhaka, Gulshan"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Professional Details</h3>
              <p className="text-gray-600">Tell us about your training background</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell clients about your training philosophy and approach..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                placeholder="e.g., 5"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                min="0"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (৳)</Label>
              <Input
                id="rate"
                type="number"
                placeholder="e.g., 1500"
                value={formData.rate_per_hour}
                onChange={(e) => setFormData({ ...formData, rate_per_hour: e.target.value })}
                min="1"
                step="1"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Specializations</h3>
              <p className="text-gray-600">Select all that apply to your expertise</p>
            </div>

            <div className="space-y-3">
              <Label>Select Your Specializations</Label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {specializationOptions.map((specialization) => (
                  <div key={specialization} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialization}
                      checked={formData.specializations.includes(specialization)}
                      onCheckedChange={(checked) => 
                        handleSpecializationChange(specialization, checked as boolean)
                      }
                    />
                    <Label htmlFor={specialization} className="text-sm font-normal">
                      {specialization}
                    </Label>
                  </div>
                ))}
              </div>
              
              {formData.specializations.length > 0 && (
                <div className="mt-3">
                  <Label className="text-sm text-gray-600">Selected ({formData.specializations.length}):</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                        {spec}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleSpecializationChange(spec, false)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Languages & Certifications</h3>
              <p className="text-gray-600">Complete your professional profile</p>
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray('languages', currentLanguage, setCurrentLanguage)}
                disabled={!currentLanguage}
              >
                Add Language
              </Button>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                    {lang}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('languages', lang)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <Input
                placeholder="e.g., NASM CPT, ACE, ACSM"
                value={currentCertification}
                onChange={(e) => setCurrentCertification(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray('certifications', currentCertification, setCurrentCertification)}
                disabled={!currentCertification}
              >
                Add Certification
              </Button>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                    {cert}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('certifications', cert)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">✓</span>
              </div>
              <p className="text-gray-600">You're all set! Ready to start offering your services?</p>
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
            Let's set up your trainer profile
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

export default TrainerOnboardingWizard;

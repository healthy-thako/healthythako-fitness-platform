import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Award, DollarSign, Clock, CheckCircle, ArrowRight, ArrowLeft, Upload, Camera } from 'lucide-react';
import { useCreateTrainer } from '@/hooks/useAdminTrainers';
import { toast } from 'sonner';
import ProfileImageUpload from '@/components/ProfileImageUpload';

const trainerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  location: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bio: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  rate_per_hour: z.number().min(0).optional(),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  profile_image: z.string().optional(),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface AddTrainerWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddTrainerWizard: React.FC<AddTrainerWizardProps> = ({ open, onOpenChange, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');

  const createTrainer = useCreateTrainer();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      specializations: [],
      languages: []
    }
  });

  const watchedValues = watch();

  const addSpecialization = () => {
    if (newSpecialization.trim() && !specializations.includes(newSpecialization.trim())) {
      const updated = [...specializations, newSpecialization.trim()];
      setSpecializations(updated);
      setValue('specializations', updated);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    const updated = specializations.filter(s => s !== spec);
    setSpecializations(updated);
    setValue('specializations', updated);
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      const updated = [...languages, newLanguage.trim()];
      setLanguages(updated);
      setValue('languages', updated);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    const updated = languages.filter(l => l !== lang);
    setLanguages(updated);
    setValue('languages', updated);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setProfileImage(imageUrl);
    setValue('profile_image', imageUrl);
    toast.success('Profile image uploaded successfully');
  };

  const onSubmit = async (data: TrainerFormData) => {
    try {
      console.log('Creating trainer with data:', data);
      
      // Ensure required fields are present
      if (!data.email || !data.password || !data.name) {
        toast.error('Email, password, and name are required');
        return;
      }

      const trainerData = {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        location: data.location,
        gender: data.gender,
        bio: data.bio,
        specializations,
        languages,
        rate_per_hour: data.rate_per_hour,
        experience_years: data.experience_years,
        profile_image: profileImage
      };

      await createTrainer.mutateAsync(trainerData);
      toast.success('Trainer created successfully');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating trainer:', error);
      toast.error(error.message || 'Failed to create trainer');
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSpecializations([]);
    setLanguages([]);
    setNewSpecialization('');
    setNewLanguage('');
    setProfileImage('');
    reset();
    onOpenChange(false);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { number: 1, title: 'Account', icon: User },
    { number: 2, title: 'Profile', icon: Camera },
    { number: 3, title: 'Experience', icon: Award },
    { number: 4, title: 'Pricing', icon: DollarSign },
    { number: 5, title: 'Review', icon: CheckCircle },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-center">Add New Trainer</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-between mb-6 flex-shrink-0">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.number 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs mt-1 text-gray-600">{step.title}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
          {/* Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-2 mb-6">
            {/* Step 1: Account Setup */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        {...register('email')}
                        placeholder="trainer@example.com"
                        className="mt-1"
                      />
                      {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password')}
                        placeholder="Minimum 6 characters"
                        className="mt-1"
                      />
                      {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Enter full name"
                      className="mt-1"
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="+880..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select onValueChange={(value) => setValue('gender', value as any)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register('location')}
                      placeholder="City, Area"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Profile Image */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <ProfileImageUpload
                      currentImage={profileImage}
                      onImageUploaded={handleImageUploaded}
                      className="mx-auto"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Upload a professional profile image (Max 5MB)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Experience & Skills */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experience & Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register('bio')}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      {...register('experience_years', { valueAsNumber: true })}
                      placeholder="0"
                      className="mt-1"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label>Specializations</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        placeholder="Add specialization"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                      />
                      <Button type="button" onClick={addSpecialization} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {specializations.map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeSpecialization(spec)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Languages</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add language"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <Button type="button" onClick={addLanguage} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                          <button
                            type="button"
                            onClick={() => removeLanguage(lang)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rate_per_hour">Rate per Hour (৳)</Label>
                    <Input
                      id="rate_per_hour"
                      type="number"
                      {...register('rate_per_hour', { valueAsNumber: true })}
                      placeholder="1000"
                      className="mt-1"
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileImage && (
                    <div className="text-center">
                      <img src={profileImage} alt="Profile" className="w-16 h-16 rounded-full mx-auto mb-2" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span> {watchedValues.email}
                    </div>
                    <div>
                      <span className="font-medium">Name:</span> {watchedValues.name}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {watchedValues.phone || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {watchedValues.location || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span> {watchedValues.experience_years || 0} years
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span> ৳{watchedValues.rate_per_hour || 0}/hour
                    </div>
                  </div>
                  {watchedValues.bio && (
                    <div>
                      <span className="font-medium">Bio:</span>
                      <p className="text-sm text-gray-600 mt-1">{watchedValues.bio}</p>
                    </div>
                  )}
                  {specializations.length > 0 && (
                    <div>
                      <span className="font-medium">Specializations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {specializations.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between flex-shrink-0 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createTrainer.isPending}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {createTrainer.isPending ? 'Creating...' : 'Create Trainer'}
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrainerWizard;

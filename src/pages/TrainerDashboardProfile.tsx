
import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainerProfile, useUpdateUserProfile, useUpdateTrainerProfile } from '@/hooks/useTrainerProfileCRUD';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const TrainerDashboardProfile = () => {
  const { user } = useAuth();
  const { data: profileData, isLoading } = useTrainerProfile();
  const updateUserProfile = useUpdateUserProfile();
  const updateTrainerProfile = useUpdateTrainerProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    experience_years: 0,
    rate_per_hour: 0,
    specializations: [] as string[]
  });

  React.useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.profile?.name || '',
        phone: profileData.profile?.phone || '',
        location: profileData.profile?.location || '',
        bio: profileData.trainerProfile?.bio || '',
        experience_years: profileData.trainerProfile?.experience_years || 0,
        rate_per_hour: profileData.trainerProfile?.rate_per_hour || 0,
        specializations: profileData.trainerProfile?.specializations || []
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    try {
      // Update user profile
      await updateUserProfile.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        location: formData.location
      });

      // Update trainer profile
      await updateTrainerProfile.mutateAsync({
        bio: formData.bio,
        experience_years: formData.experience_years,
        rate_per_hour: formData.rate_per_hour,
        specializations: formData.specializations
      });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.profile?.name || '',
        phone: profileData.profile?.phone || '',
        location: profileData.profile?.location || '',
        bio: profileData.trainerProfile?.bio || '',
        experience_years: profileData.trainerProfile?.experience_years || 0,
        rate_per_hour: profileData.trainerProfile?.rate_per_hour || 0,
        specializations: profileData.trainerProfile?.specializations || []
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-base sm:text-lg font-bold">My Profile</h1>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="bg-pink-600 hover:bg-pink-700" size="sm">
              <Edit className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          ) : (
            <div className="flex gap-1 sm:gap-2">
              <Button onClick={handleSave} disabled={updateUserProfile.isPending || updateTrainerProfile.isPending} size="sm">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} size="sm">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-2 sm:p-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                <span className="text-sm sm:text-lg font-bold text-pink-600">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'T'}
                </span>
              </div>
              <CardTitle className="text-sm sm:text-base">{formData.name || 'Trainer'}</CardTitle>
              <p className="text-gray-600 text-xs">{user?.email}</p>
              {formData.location && (
                <div className="flex items-center justify-center text-gray-600 mt-1 sm:mt-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="text-xs">{formData.location}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">Experience</span>
                  <span className="font-medium text-xs">{formData.experience_years} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">Rate/Hour</span>
                  <span className="font-medium text-xs">৳{formData.rate_per_hour}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">Member Since</span>
                  <span className="font-medium text-xs">
                    {profileData?.profile?.created_at 
                      ? new Date(profileData.profile.created_at).getFullYear()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="name" className="text-xs">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 text-xs">{formData.name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 text-xs">{formData.phone || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location" className="text-xs">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 text-xs">{formData.location || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="experience" className="text-xs">Experience (Years)</Label>
                  {isEditing ? (
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 text-xs">{formData.experience_years || 0} years</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="rate" className="text-xs">Rate per Hour (৳)</Label>
                  {isEditing ? (
                    <Input
                      id="rate"
                      type="number"
                      value={formData.rate_per_hour}
                      onChange={(e) => setFormData({ ...formData, rate_per_hour: parseFloat(e.target.value) || 0 })}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1 text-xs">৳{formData.rate_per_hour || 0}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="text-xs">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell clients about yourself..."
                    rows={2}
                    className="text-xs sm:text-sm"
                  />
                ) : (
                  <p className="text-gray-900 mt-1 text-xs">{formData.bio || 'No bio added yet'}</p>
                )}
              </div>

              {/* Specializations */}
              <div>
                <Label className="text-xs">Specializations</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.specializations.length > 0 ? (
                    formData.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-600 text-xs">No specializations added yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboardProfile;

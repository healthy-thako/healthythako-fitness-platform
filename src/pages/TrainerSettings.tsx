
import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainerProfile, useUpdateUserProfile, useUpdateTrainerProfile } from '@/hooks/useTrainerProfileCRUD';
import { Settings, Bell, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const TrainerSettings = () => {
  const { user } = useAuth();
  const { data: profileData } = useTrainerProfile();
  const updateUserProfile = useUpdateUserProfile();
  const updateTrainerProfile = useUpdateTrainerProfile();

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    location: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    bookings: true,
    messages: true,
    reviews: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showRating: true,
    showLocation: true
  });

  // Load existing data
  useEffect(() => {
    if (profileData?.profile) {
      setProfileForm({
        name: profileData.profile.name || '',
        phone: profileData.profile.phone || '',
        location: profileData.profile.location || ''
      });
    }
  }, [profileData]);

  const handleProfileSave = async () => {
    try {
      await updateUserProfile.mutateAsync({
        name: profileForm.name,
        phone: profileForm.phone,
        location: profileForm.location
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    
    // Save to database - you might want to create a user_preferences table
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          [`notification_${key}`]: value 
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      toast.success('Notification preference updated');
    } catch (error) {
      toast.error('Failed to update notification preference');
    }
  };

  const handlePrivacyChange = async (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    
    try {
      const updateData: any = {};
      if (key === 'profileVisible') updateData.is_verified = value;
      
      await updateTrainerProfile.mutateAsync(updateData);
      toast.success('Privacy setting updated');
    } catch (error) {
      toast.error('Failed to update privacy setting');
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Settings</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your account preferences and privacy settings</p>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
          {/* Profile Settings */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="flex items-center text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs">Display Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your display name"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Your phone number"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-xs">Location</Label>
                <Input
                  id="location"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Your location"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
              <Button 
                className="w-full" 
                size="sm" 
                onClick={handleProfileSave}
                disabled={updateUserProfile.isPending}
              >
                {updateUserProfile.isPending ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="flex items-center text-sm">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-xs">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(value) => handleNotificationChange('email', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-xs">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(value) => handleNotificationChange('push', value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="booking-notifications" className="text-xs">New Bookings</Label>
                <Switch
                  id="booking-notifications"
                  checked={notifications.bookings}
                  onCheckedChange={(value) => handleNotificationChange('bookings', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="message-notifications" className="text-xs">New Messages</Label>
                <Switch
                  id="message-notifications"
                  checked={notifications.messages}
                  onCheckedChange={(value) => handleNotificationChange('messages', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="review-notifications" className="text-xs">New Reviews</Label>
                <Switch
                  id="review-notifications"
                  checked={notifications.reviews}
                  onCheckedChange={(value) => handleNotificationChange('reviews', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="flex items-center text-sm">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visible" className="text-xs">Profile Visible to Clients</Label>
                <Switch
                  id="profile-visible"
                  checked={privacy.profileVisible}
                  onCheckedChange={(value) => handlePrivacyChange('profileVisible', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-rating" className="text-xs">Show Rating Publicly</Label>
                <Switch
                  id="show-rating"
                  checked={privacy.showRating}
                  onCheckedChange={(value) => handlePrivacyChange('showRating', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-location" className="text-xs">Show Location in Profile</Label>
                <Switch
                  id="show-location"
                  checked={privacy.showLocation}
                  onCheckedChange={(value) => handlePrivacyChange('showLocation', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="flex items-center text-sm">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button variant="outline" className="w-full" size="sm">
                Change Password
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Enable Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Download Account Data
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full" size="sm">
                Deactivate Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;

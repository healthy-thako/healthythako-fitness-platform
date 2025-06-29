import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Phone, MapPin, Bell, Shield, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useClientData';

const ClientSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: notificationPrefs, isLoading: prefsLoading } = useNotificationPreferences();
  const updateNotificationPrefs = useUpdateNotificationPreferences();

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      if (!user) throw new Error('No user');

      // Map old field names to new schema
      const mappedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) mappedUpdates.full_name = updates.name;
      if (updates.phone) mappedUpdates.phone_number = updates.phone;
      if (updates.email) mappedUpdates.email = updates.email;

      const { data, error } = await supabase
        .from('users')
        .update(mappedUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    date_of_birth: profile?.date_of_birth || ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        date_of_birth: profile.date_of_birth || ''
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    if (!notificationPrefs) return;
    
    updateNotificationPrefs.mutate({
      [field]: value
    });
  };

  if (isLoading || prefsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-xs sm:text-base text-gray-600">Manage your account preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="date_of_birth" className="text-sm">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={updateProfile.isPending}
                className="mesh-gradient-overlay text-white text-sm"
                size="sm"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">Email Notifications</p>
                <p className="text-xs sm:text-sm text-gray-600">Receive booking updates via email</p>
              </div>
              <Switch
                checked={notificationPrefs?.email_notifications ?? true}
                onCheckedChange={(checked) => 
                  handleNotificationChange('email_notifications', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">Push Notifications</p>
                <p className="text-xs sm:text-sm text-gray-600">Get instant notifications on your device</p>
              </div>
              <Switch
                checked={notificationPrefs?.push_notifications ?? true}
                onCheckedChange={(checked) => 
                  handleNotificationChange('push_notifications', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">SMS Notifications</p>
                <p className="text-xs sm:text-sm text-gray-600">Receive SMS for important updates</p>
              </div>
              <Switch
                checked={notificationPrefs?.sms_notifications ?? false}
                onCheckedChange={(checked) => 
                  handleNotificationChange('sms_notifications', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">Booking Reminders</p>
                <p className="text-xs sm:text-sm text-gray-600">Get reminders before your sessions</p>
              </div>
              <Switch
                checked={notificationPrefs?.booking_reminders ?? true}
                onCheckedChange={(checked) => 
                  handleNotificationChange('booking_reminders', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">Payment Notifications</p>
                <p className="text-xs sm:text-sm text-gray-600">Notifications about payments and transactions</p>
              </div>
              <Switch
                checked={notificationPrefs?.payment_notifications ?? true}
                onCheckedChange={(checked) => 
                  handleNotificationChange('payment_notifications', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm sm:text-base">Marketing Emails</p>
                <p className="text-xs sm:text-sm text-gray-600">Receive promotional content and updates</p>
              </div>
              <Switch
                checked={notificationPrefs?.marketing_emails ?? false}
                onCheckedChange={(checked) => 
                  handleNotificationChange('marketing_emails', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start text-sm" size="sm">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm" size="sm">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 text-sm" size="sm">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSettings;

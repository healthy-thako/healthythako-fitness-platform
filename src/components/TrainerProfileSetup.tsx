
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

const TrainerProfileSetup = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bio: '',
    rate_per_hour: '',
    experience_years: '',
    specializations: [] as string[],
    certifications: [] as string[],
    languages: [] as string[],
  });
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('trainer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFormData({
          bio: data.bio || '',
          rate_per_hour: data.rate_per_hour?.toString() || '',
          experience_years: data.experience_years?.toString() || '',
          specializations: Array.isArray(data.specializations) ? data.specializations.filter((item): item is string => typeof item === 'string') : [],
          certifications: Array.isArray(data.certifications) ? data.certifications.filter((item): item is string => typeof item === 'string') : [],
          languages: Array.isArray(data.languages) ? data.languages.filter((item): item is string => typeof item === 'string') : [],
        });
      }
    } catch (error: any) {
      toast.error('Failed to fetch profile: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map to new schema fields
      const trainerData = {
        user_id: user?.id,
        name: user?.user_metadata?.name || 'Trainer',
        bio: formData.bio,
        experience: formData.experience_years,
        pricing: {
          hourly_rate: parseFloat(formData.rate_per_hour)
        },
        specialties: formData.specializations,
        certifications: formData.certifications,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('trainers')
        .upsert(trainerData);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (type: 'specializations' | 'certifications' | 'languages', item: string) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], item.trim()]
      }));
      
      if (type === 'specializations') setNewSpecialization('');
      if (type === 'certifications') setNewCertification('');
      if (type === 'languages') setNewLanguage('');
    }
  };

  const removeItem = (type: 'specializations' | 'certifications' | 'languages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Trainer Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell clients about yourself, your experience, and training philosophy..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rate_per_hour">Rate per Hour (৳)</Label>
              <Input
                id="rate_per_hour"
                type="number"
                placeholder="1500"
                value={formData.rate_per_hour}
                onChange={(e) => setFormData(prev => ({ ...prev, rate_per_hour: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                placeholder="5"
                value={formData.experience_years}
                onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Specializations</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                placeholder="e.g., Weight Loss, Yoga, Strength Training"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('specializations', newSpecialization))}
              />
              <Button 
                type="button"
                onClick={() => addItem('specializations', newSpecialization)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {spec}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeItem('specializations', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Certifications</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                placeholder="e.g., NASM-CPT, RYT-200"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('certifications', newCertification))}
              />
              <Button 
                type="button"
                onClick={() => addItem('certifications', newCertification)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {cert}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeItem('certifications', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Languages</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                placeholder="e.g., English, Bengali, Hindi"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('languages', newLanguage))}
              />
              <Button 
                type="button"
                onClick={() => addItem('languages', newLanguage)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {lang}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeItem('languages', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrainerProfileSetup;

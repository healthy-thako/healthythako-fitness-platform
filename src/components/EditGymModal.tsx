
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Loader2 } from 'lucide-react';
import { Gym } from '@/hooks/useGyms';

interface EditGymModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gym: Gym;
  onSubmit: (gymData: Partial<Omit<Gym, 'id' | 'created_at' | 'updated_at'>>) => void;
  isLoading?: boolean;
}

const EditGymModal: React.FC<EditGymModalProps> = ({
  open,
  onOpenChange,
  gym,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    area: '',
    phone: '',
    email: '',
    website: '',
    images: [''],
    is_verified: false,
    is_active: true
  });

  useEffect(() => {
    if (gym) {
      setFormData({
        name: gym.name || '',
        description: gym.description || '',
        address: gym.address || '',
        city: gym.city || '',
        area: gym.area || '',
        phone: gym.phone || '',
        email: gym.email || '',
        website: gym.website || '',
        images: gym.images && gym.images.length > 0 ? gym.images : [''],
        is_verified: gym.is_verified || false,
        is_active: gym.is_active !== false
      });
    }
  }, [gym]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== '')
    };
    
    onSubmit(cleanedData);
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Gym - {gym?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Gym Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Images</h3>
              <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
            
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Image URL"
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                />
                {formData.images.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_verified: checked }))}
              />
              <Label htmlFor="verified">Verified Gym</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Active Status</Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#8b1538] hover:bg-[#6b1029]">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Gym'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGymModal;

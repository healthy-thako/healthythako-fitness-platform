
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGig } from '@/hooks/useGigsCRUD';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateGigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGigModal: React.FC<CreateGigModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    basic_price: '',
    basic_description: '',
    basic_delivery_days: '7',
    standard_price: '',
    standard_description: '',
    standard_delivery_days: '5',
    premium_price: '',
    premium_description: '',
    premium_delivery_days: '3',
    requirements: '',
    tags: '',
  });

  const createGig = useCreateGig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.basic_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const gigData = {
        title: formData.title,
        description: formData.description,
        category: formData.category || 'fitness',
        basic_price: parseFloat(formData.basic_price),
        basic_description: formData.basic_description,
        basic_delivery_days: parseInt(formData.basic_delivery_days),
        standard_price: formData.standard_price ? parseFloat(formData.standard_price) : undefined,
        standard_description: formData.standard_description || undefined,
        standard_delivery_days: formData.standard_delivery_days ? parseInt(formData.standard_delivery_days) : undefined,
        premium_price: formData.premium_price ? parseFloat(formData.premium_price) : undefined,
        premium_description: formData.premium_description || undefined,
        premium_delivery_days: formData.premium_delivery_days ? parseInt(formData.premium_delivery_days) : undefined,
        requirements: formData.requirements || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : undefined,
        status: 'active' as const,
      };

      await createGig.mutateAsync(gigData);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        basic_price: '',
        basic_description: '',
        basic_delivery_days: '7',
        standard_price: '',
        standard_description: '',
        standard_delivery_days: '5',
        premium_price: '',
        premium_description: '',
        premium_delivery_days: '3',
        requirements: '',
        tags: '',
      });
    } catch (error) {
      console.error('Error creating gig:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Gig</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <Label htmlFor="title">Gig Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="I will provide personal fitness training..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your service in detail..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fitness">General Fitness</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="weightlifting">Weight Lifting</SelectItem>
                  <SelectItem value="cardio">Cardio Training</SelectItem>
                  <SelectItem value="nutrition">Nutrition Coaching</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="fitness, training, health, workout"
              />
            </div>
          </div>

          {/* Package Tiers */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Package Tiers</h3>
            
            {/* Basic Package */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-green-600">Basic Package *</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basic_price">Price (৳) *</Label>
                  <Input
                    id="basic_price"
                    type="number"
                    value={formData.basic_price}
                    onChange={(e) => handleInputChange('basic_price', e.target.value)}
                    placeholder="1500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basic_delivery_days">Delivery Days</Label>
                  <Input
                    id="basic_delivery_days"
                    type="number"
                    value={formData.basic_delivery_days}
                    onChange={(e) => handleInputChange('basic_delivery_days', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="basic_description">What's included in basic package</Label>
                <Textarea
                  id="basic_description"
                  value={formData.basic_description}
                  onChange={(e) => handleInputChange('basic_description', e.target.value)}
                  placeholder="Basic workout plan, 2 sessions per week..."
                  rows={2}
                />
              </div>
            </div>

            {/* Standard Package */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-blue-600">Standard Package</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="standard_price">Price (৳)</Label>
                  <Input
                    id="standard_price"
                    type="number"
                    value={formData.standard_price}
                    onChange={(e) => handleInputChange('standard_price', e.target.value)}
                    placeholder="3000"
                  />
                </div>
                <div>
                  <Label htmlFor="standard_delivery_days">Delivery Days</Label>
                  <Input
                    id="standard_delivery_days"
                    type="number"
                    value={formData.standard_delivery_days}
                    onChange={(e) => handleInputChange('standard_delivery_days', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="standard_description">What's included in standard package</Label>
                <Textarea
                  id="standard_description"
                  value={formData.standard_description}
                  onChange={(e) => handleInputChange('standard_description', e.target.value)}
                  placeholder="Custom workout plan, 4 sessions per week, nutrition advice..."
                  rows={2}
                />
              </div>
            </div>

            {/* Premium Package */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-purple-600">Premium Package</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="premium_price">Price (৳)</Label>
                  <Input
                    id="premium_price"
                    type="number"
                    value={formData.premium_price}
                    onChange={(e) => handleInputChange('premium_price', e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="premium_delivery_days">Delivery Days</Label>
                  <Input
                    id="premium_delivery_days"
                    type="number"
                    value={formData.premium_delivery_days}
                    onChange={(e) => handleInputChange('premium_delivery_days', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="premium_description">What's included in premium package</Label>
                <Textarea
                  id="premium_description"
                  value={formData.premium_description}
                  onChange={(e) => handleInputChange('premium_description', e.target.value)}
                  placeholder="Personalized training, daily sessions, meal plans, 24/7 support..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Requirements from clients</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Please provide your fitness goals, current fitness level, any health conditions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createGig.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {createGig.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Gig'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

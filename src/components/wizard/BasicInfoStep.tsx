import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { GigFormData } from '../CreateGigWizard';

interface BasicInfoStepProps {
  formData: GigFormData;
  updateFormData: (updates: Partial<GigFormData>) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, updateFormData }) => {
  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      updateFormData({ tags: [...formData.tags, tag] });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = e.currentTarget.value.trim();
      if (tag) {
        handleTagAdd(tag);
        e.currentTarget.value = '';
      }
    }
  };

  const getTitleCharCount = () => formData.title.length;
  const getDescriptionCharCount = () => formData.description.length;
  const getTitleStatus = () => {
    const count = getTitleCharCount();
    if (count === 0) return { color: 'text-gray-400', icon: null };
    if (count < 10) return { color: 'text-red-500', icon: AlertCircle };
    if (count > 80) return { color: 'text-red-500', icon: AlertCircle };
    return { color: 'text-green-500', icon: CheckCircle };
  };

  const getDescriptionStatus = () => {
    const count = getDescriptionCharCount();
    if (count === 0) return { color: 'text-gray-400', icon: null };
    if (count < 100) return { color: 'text-red-500', icon: AlertCircle };
    if (count > 1200) return { color: 'text-red-500', icon: AlertCircle };
    return { color: 'text-green-500', icon: CheckCircle };
  };

  const titleStatus = getTitleStatus();
  const descriptionStatus = getDescriptionStatus();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-gray-600">Tell us about your fitness service</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gig Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Gig Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value.slice(0, 80) })}
              placeholder="I will provide personal fitness training..."
              className="mt-2"
              maxLength={80}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Create a compelling title that describes your service
              </p>
              <div className={`flex items-center gap-1 text-xs ${titleStatus.color}`}>
                {titleStatus.icon && <titleStatus.icon className="h-3 w-3" />}
                <span>{getTitleCharCount()}/80</span>
              </div>
            </div>
            {getTitleCharCount() > 0 && getTitleCharCount() < 10 && (
              <p className="text-xs text-red-500 mt-1">Title should be at least 10 characters</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value.slice(0, 1200) })}
              placeholder="Describe your service in detail. What makes you unique? What will clients get? Include your experience, specializations, and what clients can expect."
              rows={6}
              className="mt-2 resize-none"
              maxLength={1200}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Provide a detailed description (minimum 100 characters)
              </p>
              <div className={`flex items-center gap-1 text-xs ${descriptionStatus.color}`}>
                {descriptionStatus.icon && <descriptionStatus.icon className="h-3 w-3" />}
                <span>{getDescriptionCharCount()}/1200</span>
              </div>
            </div>
            {getDescriptionCharCount() > 0 && getDescriptionCharCount() < 100 && (
              <p className="text-xs text-red-500 mt-1">Description should be at least 100 characters</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData({ category: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fitness">General Fitness</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="weightlifting">Weight Lifting</SelectItem>
                <SelectItem value="cardio">Cardio Training</SelectItem>
                <SelectItem value="nutrition">Nutrition Coaching</SelectItem>
                <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                <SelectItem value="sports">Sports Training</SelectItem>
                <SelectItem value="dance">Dance Fitness</SelectItem>
                <SelectItem value="pilates">Pilates</SelectItem>
                <SelectItem value="crossfit">CrossFit</SelectItem>
                <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                <SelectItem value="functional">Functional Training</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the category that best fits your service
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tags" className="text-sm font-medium">
              Add Tags (Optional)
            </Label>
            <Input
              id="tags"
              placeholder="Type a tag and press Enter (e.g., weight loss, muscle gain)"
              onKeyDown={handleTagInputKeyDown}
              className="mt-2"
              disabled={formData.tags.length >= 5}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add relevant keywords to help clients find your gig. Press Enter or comma to add. Maximum 5 tags.
            </p>
          </div>

          {formData.tags.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleTagRemove(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.tags.length}/5 tags added
              </p>
            </div>
          )}

          {/* Popular tag suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Popular tags:</p>
            <div className="flex flex-wrap gap-1">
              {['weight loss', 'muscle gain', 'flexibility', 'strength training', 'home workout', 'diet plan'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleTagAdd(suggestion)}
                  disabled={formData.tags.includes(suggestion) || formData.tags.length >= 5}
                  className="text-xs px-2 py-1 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use specific, action-oriented titles</li>
            <li>• Mention your experience and qualifications</li>
            <li>• Include what makes your service unique</li>
            <li>• Be clear about what clients will receive</li>
            <li>• Use keywords clients might search for</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

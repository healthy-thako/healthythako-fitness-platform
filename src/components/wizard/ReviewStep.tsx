
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Image, Tag } from 'lucide-react';
import { GigFormData } from '../CreateGigWizard';

interface ReviewStepProps {
  formData: GigFormData;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Review Your Gig</h3>
        <p className="text-gray-600">Review all details before publishing</p>
      </div>

      {/* Gig Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">{formData.title}</span>
            <Badge variant="secondary">{formData.category}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{formData.description}</p>
          
          {formData.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{formData.images.length} Images</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {formData.images.slice(0, 4).map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Basic Package */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-600 text-sm">Basic Package</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-600">৳{formData.basic_price}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{formData.basic_delivery_days} days</span>
            </div>
            <p className="text-xs text-gray-600">{formData.basic_description}</p>
          </CardContent>
        </Card>

        {/* Standard Package */}
        {formData.standard_price && (
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-600 text-sm">Standard Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-blue-600">৳{formData.standard_price}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{formData.standard_delivery_days} days</span>
              </div>
              <p className="text-xs text-gray-600">{formData.standard_description}</p>
            </CardContent>
          </Card>
        )}

        {/* Premium Package */}
        {formData.premium_price && (
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-600 text-sm">Premium Package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="font-bold text-purple-600">৳{formData.premium_price}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{formData.premium_delivery_days} days</span>
              </div>
              <p className="text-xs text-gray-600">{formData.premium_description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Requirements */}
      {formData.requirements && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Requirements from Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{formData.requirements}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

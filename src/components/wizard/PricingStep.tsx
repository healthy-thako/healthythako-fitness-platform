import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { GigFormData } from '../CreateGigWizard';

interface PricingStepProps {
  formData: GigFormData;
  updateFormData: (updates: Partial<GigFormData>) => void;
}

export const PricingStep: React.FC<PricingStepProps> = ({ formData, updateFormData }) => {
  const [enableStandard, setEnableStandard] = React.useState(!!formData.standard_price);
  const [enablePremium, setEnablePremium] = React.useState(!!formData.premium_price);

  const handleStandardToggle = (enabled: boolean) => {
    setEnableStandard(enabled);
    if (!enabled) {
      updateFormData({
        standard_price: undefined,
        standard_description: undefined,
        standard_delivery_days: undefined
      });
    } else {
      updateFormData({
        standard_price: 0,
        standard_delivery_days: 5
      });
    }
  };

  const handlePremiumToggle = (enabled: boolean) => {
    setEnablePremium(enabled);
    if (!enabled) {
      updateFormData({
        premium_price: undefined,
        premium_description: undefined,
        premium_delivery_days: undefined
      });
    } else {
      updateFormData({
        premium_price: 0,
        premium_delivery_days: 3
      });
    }
  };

  const getValidationStatus = (price: number | undefined, description: string | undefined, isRequired = false) => {
    if (isRequired) {
      if (!price || price <= 0) return { color: 'text-red-500', icon: AlertCircle, message: 'Price is required' };
      if (!description?.trim()) return { color: 'text-red-500', icon: AlertCircle, message: 'Description is required' };
    }
    if (price && description?.trim()) {
      return { color: 'text-green-500', icon: CheckCircle, message: 'Complete' };
    }
    return { color: 'text-gray-400', icon: null, message: '' };
  };

  const basicStatus = getValidationStatus(formData.basic_price, formData.basic_description, true);
  const standardStatus = enableStandard ? getValidationStatus(formData.standard_price, formData.standard_description) : null;
  const premiumStatus = enablePremium ? getValidationStatus(formData.premium_price, formData.premium_description) : null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Package & Pricing</h3>
        <p className="text-gray-600">Define your service packages to give clients options</p>
      </div>

      {/* Package Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Package Strategy</p>
              <p>Start with a Basic package (required), then add Standard and Premium for higher earnings. Each package should offer clear additional value.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Package - Always Required */}
      <Card className="border-green-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-green-600">Basic Package</CardTitle>
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </div>
            <div className="flex items-center gap-1">
              {basicStatus.icon && <basicStatus.icon className={`h-4 w-4 ${basicStatus.color}`} />}
              <span className={`text-xs ${basicStatus.color}`}>{basicStatus.message}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basic_price" className="text-sm font-medium">
                Price (৳) *
              </Label>
              <Input
                id="basic_price"
                type="number"
                min="1"
                value={formData.basic_price || ''}
                onChange={(e) => updateFormData({ basic_price: parseFloat(e.target.value) || 0 })}
                placeholder="1500"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Set a competitive starting price</p>
            </div>
            <div>
              <Label htmlFor="basic_delivery_days" className="text-sm font-medium">
                Delivery Days *
              </Label>
              <Input
                id="basic_delivery_days"
                type="number"
                min="1"
                max="30"
                value={formData.basic_delivery_days}
                onChange={(e) => updateFormData({ basic_delivery_days: parseInt(e.target.value) || 7 })}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Time to complete this package</p>
            </div>
          </div>
          <div>
            <Label htmlFor="basic_description" className="text-sm font-medium">
              What's included *
            </Label>
            <Textarea
              id="basic_description"
              value={formData.basic_description}
              onChange={(e) => updateFormData({ basic_description: e.target.value })}
              placeholder="• Custom workout plan tailored to your goals&#10;• 2 training sessions per week&#10;• Basic nutrition guidance&#10;• Progress tracking"
              rows={4}
              className="mt-2 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              List what clients get with this package (use bullet points)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Standard Package */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-blue-600">Standard Package</CardTitle>
              <Badge variant="outline" className="text-xs">Most Popular</Badge>
            </div>
            <div className="flex items-center gap-3">
              {standardStatus && (
                <div className="flex items-center gap-1">
                  {standardStatus.icon && <standardStatus.icon className={`h-4 w-4 ${standardStatus.color}`} />}
                  <span className={`text-xs ${standardStatus.color}`}>{standardStatus.message}</span>
                </div>
              )}
              <Switch
                checked={enableStandard}
                onCheckedChange={handleStandardToggle}
              />
            </div>
          </div>
        </CardHeader>
        {enableStandard && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="standard_price" className="text-sm font-medium">
                  Price (৳)
                </Label>
                <Input
                  id="standard_price"
                  type="number"
                  min="1"
                  value={formData.standard_price || ''}
                  onChange={(e) => updateFormData({ standard_price: parseFloat(e.target.value) || undefined })}
                  placeholder="3000"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">2-3x basic price typically</p>
              </div>
              <div>
                <Label htmlFor="standard_delivery_days" className="text-sm font-medium">
                  Delivery Days
                </Label>
                <Input
                  id="standard_delivery_days"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.standard_delivery_days || 5}
                  onChange={(e) => updateFormData({ standard_delivery_days: parseInt(e.target.value) || 5 })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Usually faster delivery</p>
              </div>
            </div>
            <div>
              <Label htmlFor="standard_description" className="text-sm font-medium">
                What's included
              </Label>
              <Textarea
                id="standard_description"
                value={formData.standard_description || ''}
                onChange={(e) => updateFormData({ standard_description: e.target.value })}
                placeholder="Everything in Basic plus:&#10;• 4 training sessions per week&#10;• Detailed nutrition plan&#10;• Weekly progress check-ins&#10;• Exercise video library access"
                rows={4}
                className="mt-2 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include all Basic features plus additional value
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Premium Package */}
      <Card className="border-purple-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-purple-600">Premium Package</CardTitle>
              <Badge variant="outline" className="text-xs">Best Value</Badge>
            </div>
            <div className="flex items-center gap-3">
              {premiumStatus && (
                <div className="flex items-center gap-1">
                  {premiumStatus.icon && <premiumStatus.icon className={`h-4 w-4 ${premiumStatus.color}`} />}
                  <span className={`text-xs ${premiumStatus.color}`}>{premiumStatus.message}</span>
                </div>
              )}
              <Switch
                checked={enablePremium}
                onCheckedChange={handlePremiumToggle}
              />
            </div>
          </div>
        </CardHeader>
        {enablePremium && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="premium_price" className="text-sm font-medium">
                  Price (৳)
                </Label>
                <Input
                  id="premium_price"
                  type="number"
                  min="1"
                  value={formData.premium_price || ''}
                  onChange={(e) => updateFormData({ premium_price: parseFloat(e.target.value) || undefined })}
                  placeholder="5000"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Premium pricing for maximum value</p>
              </div>
              <div>
                <Label htmlFor="premium_delivery_days" className="text-sm font-medium">
                  Delivery Days
                </Label>
                <Input
                  id="premium_delivery_days"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.premium_delivery_days || 3}
                  onChange={(e) => updateFormData({ premium_delivery_days: parseInt(e.target.value) || 3 })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">Fastest delivery time</p>
              </div>
            </div>
            <div>
              <Label htmlFor="premium_description" className="text-sm font-medium">
                What's included
              </Label>
              <Textarea
                id="premium_description"
                value={formData.premium_description || ''}
                onChange={(e) => updateFormData({ premium_description: e.target.value })}
                placeholder="Everything in Standard plus:&#10;• Daily training sessions&#10;• Custom meal planning&#10;• 24/7 WhatsApp support&#10;• Weekly video calls&#10;• Supplement recommendations"
                rows={4}
                className="mt-2 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Premium features and personalized attention
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pricing Tips */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-yellow-900 mb-2">💰 Pricing Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Research competitor prices in your category</li>
            <li>• Basic: Entry-level pricing to attract clients</li>
            <li>• Standard: 2-3x basic price with significant added value</li>
            <li>• Premium: Premium pricing for comprehensive service</li>
            <li>• Include clear deliverables in each package</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

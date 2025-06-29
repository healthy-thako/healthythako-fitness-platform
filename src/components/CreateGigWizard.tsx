import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreateGig } from '@/hooks/useGigsCRUD';
import { useGigImageUpload } from '@/hooks/useGigImageUpload';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Upload, X, Check } from 'lucide-react';
import { BasicInfoStep } from './wizard/BasicInfoStep';
import { PricingStep } from './wizard/PricingStep';
import { MediaStep } from './wizard/MediaStep';
import { ReviewStep } from './wizard/ReviewStep';
import { useAuth } from '@/contexts/AuthContext';

interface CreateGigWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface GigFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  basic_price: number;
  basic_description: string;
  basic_delivery_days: number;
  standard_price?: number;
  standard_description?: string;
  standard_delivery_days?: number;
  premium_price?: number;
  premium_description?: string;
  premium_delivery_days?: number;
  requirements: string;
  images: string[];
  faq: Array<{ question: string; answer: string }>;
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Title, description & category' },
  { id: 2, title: 'Pricing', description: 'Set your packages & prices' },
  { id: 3, title: 'Media', description: 'Upload images & portfolio' },
  { id: 4, title: 'Review', description: 'Review & publish your gig' }
];

export const CreateGigWizard: React.FC<CreateGigWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<GigFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    basic_price: 0,
    basic_description: '',
    basic_delivery_days: 7,
    requirements: '',
    images: [],
    faq: []
  });

  const createGig = useCreateGig();
  const { user } = useAuth();

  const updateFormData = (updates: Partial<GigFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Please enter a gig title');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a gig description');
        return;
      }
      if (!formData.category) {
        toast.error('Please select a category');
        return;
      }
      if (!formData.basic_price || formData.basic_price <= 0) {
        toast.error('Please enter a valid basic price');
        return;
      }
      if (!formData.basic_description.trim()) {
        toast.error('Please enter a basic package description');
        return;
      }

      const gigData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        basic_price: formData.basic_price,
        basic_description: formData.basic_description,
        basic_delivery_days: formData.basic_delivery_days,
        standard_price: formData.standard_price,
        standard_description: formData.standard_description,
        standard_delivery_days: formData.standard_delivery_days,
        premium_price: formData.premium_price,
        premium_description: formData.premium_description,
        premium_delivery_days: formData.premium_delivery_days,
        requirements: formData.requirements,
        tags: formData.tags,
        images: formData.images,
        faq: formData.faq,
        status: 'active' as const
      };

      await createGig.mutateAsync(gigData);
      toast.success('Gig created successfully!');
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating gig:', error);
      toast.error('Failed to create gig: ' + (error.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: [],
      basic_price: 0,
      basic_description: '',
      basic_delivery_days: 7,
      requirements: '',
      images: [],
      faq: []
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <PricingStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <MediaStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.category;
      case 2:
        return formData.basic_price > 0 && formData.basic_description.trim();
      case 3:
        return true; // Media step is optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  const handleClose = () => {
    if (createGig.isPending) return; // Prevent closing during submission
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-semibold">Create New Gig</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              disabled={createGig.isPending}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3 mt-4">
            <Progress value={progress} className="w-full h-2" />
            <div className="grid grid-cols-4 gap-1">
              {STEPS.map((step) => (
                <div key={step.id} className={`text-center ${currentStep === step.id ? 'text-purple-600 font-medium' : currentStep > step.id ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className="flex items-center justify-center mb-1">
                    {currentStep > step.id ? (
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                    ) : (
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        currentStep === step.id 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.id}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            {renderStep()}
          </div>
        </ScrollArea>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || createGig.isPending}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-xs text-gray-500 hidden sm:block">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              size="sm"
              disabled={createGig.isPending}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            
            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                disabled={createGig.isPending || !isStepValid()}
                className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none"
                size="sm"
              >
                {createGig.isPending ? 'Creating...' : 'Create Gig'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!isStepValid() || createGig.isPending}
                className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none"
                size="sm"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGigWizard;

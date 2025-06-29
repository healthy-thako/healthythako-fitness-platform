import React, { useState, MouseEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, ChevronLeft, ChevronRight, MapPin, Camera, Settings, CheckCircle, CreditCard, User, Lock, Clock, Dumbbell, Loader2 } from 'lucide-react';
import { Gym } from '@/hooks/useGyms';
import { GymMembershipPlan } from '@/hooks/useGymMembershipPlans';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateUser } from '@/hooks/useAdminUsers';

interface CreateGymWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (gymData: Omit<Gym, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>, amenities: string[], membershipPlans: Omit<GymMembershipPlan, 'id' | 'gym_id' | 'created_at' | 'updated_at'>[], userData?: any) => void;
  isLoading?: boolean;
}

interface OperatingHours {
  day: string;
  open: string;
  close: string;
  women_only_start?: string;
  women_only_end?: string;
}

interface MembershipPlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface ExtendedGymMembershipPlan extends Omit<GymMembershipPlan, 'id' | 'created_at' | 'updated_at' | 'gym_id'> {
  features: MembershipPlanFeature[];
  max_freeze_days: number;
  registration_fee: number;
  cancellation_fee: number;
  auto_renewal: boolean;
  min_commitment_months: number;
}

const DEFAULT_MEMBERSHIP_FEATURES = [
  { name: 'Gym Access', included: true, description: 'Access to gym equipment and facilities' },
  { name: 'Locker Room', included: true, description: 'Access to locker room and showers' },
  { name: 'Group Classes', included: false, description: 'Access to group fitness classes' },
  { name: 'Personal Training', included: false, description: 'One-on-one training sessions' },
  { name: 'Swimming Pool', included: false, description: 'Access to swimming pool' },
  { name: 'Sauna', included: false, description: 'Access to sauna facilities' },
  { name: 'Towel Service', included: false, description: 'Complimentary towel service' },
  { name: 'Nutrition Plan', included: false, description: 'Personalized nutrition guidance' }
];

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const DEFAULT_AMENITIES = [
  'Gym Equipment',
  'Cardio Area',
  'Free Weights',
  'Locker Room',
  'Showers',
  'Parking',
  'Air Conditioning',
  'Personal Training',
  'Group Classes',
  'Swimming Pool',
  'Sauna',
  'Steam Room',
  'Spa',
  'Cafe',
  'Pro Shop',
  'Towel Service',
  'WiFi'
];

const CreateGymWizard: React.FC<CreateGymWizardProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false
}) => {
  const { user } = useAuth();
  const createUser = useCreateUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Dhaka',
    area: '',
    phone: '',
    email: '',
    website: '',
    images: [''],
    amenities: [''],
    is_verified: false,
    is_active: true
  });

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'gym_owner' as const,
    location: '',
    gender: ''
  });

  const [membershipPlans, setMembershipPlans] = useState<ExtendedGymMembershipPlan[]>([
    {
      name: 'Basic',
      description: 'Access to basic gym facilities',
      price: 2000,
      duration_months: 1,
      duration_days: 30,
      plan_type: 'regular',
      features: DEFAULT_MEMBERSHIP_FEATURES,
      is_popular: false,
      is_active: true,
      max_freeze_days: 0,
      registration_fee: 0,
      cancellation_fee: 0,
      auto_renewal: true,
      min_commitment_months: 1
    }
  ]);

  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      open: '06:00',
      close: '22:00',
      women_only_start: '',
      women_only_end: ''
    }))
  );

  const [amenityInput, setAmenityInput] = useState('');
  const [suggestedAmenities, setSuggestedAmenities] = useState<string[]>([]);

  const totalSteps = createUserAccount ? 8 : 7;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Remove amenities from gym data since they're stored in a separate table
    const { amenities, ...gymDataWithoutAmenities } = formData;
    
    const cleanedData = {
      ...gymDataWithoutAmenities,
      gym_owner_id: user?.id || '',
      images: formData.images.filter(img => img.trim() !== ''),
      operating_hours: operatingHours.reduce((acc, curr) => ({
        ...acc,
        [curr.day]: {
          open: curr.open,
          close: curr.close,
          women_only: curr.women_only_start && curr.women_only_end ? {
            start: curr.women_only_start,
            end: curr.women_only_end
          } : null
        }
      }), {})
    };
    
    const cleanedAmenities = formData.amenities.filter(amenity => amenity.trim() !== '');
    const validMembershipPlans = membershipPlans.map(plan => ({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration_months: plan.duration_months,
      duration_days: plan.duration_months * 30,
      plan_type: plan.plan_type,
      is_popular: plan.is_popular,
      is_active: plan.is_active
    })).filter(plan => plan.name.trim() !== '');
    
    onSubmit(cleanedData, cleanedAmenities, validMembershipPlans, createUserAccount ? userData : undefined);
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

  const handleAmenityInputChange = (value: string) => {
    setAmenityInput(value);
    if (value.trim()) {
      const suggestions = DEFAULT_AMENITIES.filter(
        amenity => amenity.toLowerCase().includes(value.toLowerCase()) &&
        !formData.amenities.includes(amenity)
      );
      setSuggestedAmenities(suggestions);
    } else {
      setSuggestedAmenities([]);
    }
  };

  const addAmenity = (amenity: string = amenityInput) => {
    if (amenity.trim() && !formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
      setAmenityInput('');
      setSuggestedAmenities([]);
    }
  };

  const handleAddAmenityClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addAmenity();
  };

  const handleSuggestedAmenityClick = (amenity: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addAmenity(amenity);
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const updateAmenity = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.map((amenity, i) => i === index ? value : amenity)
    }));
  };

  const addMembershipPlan = () => {
    setMembershipPlans(prev => ([
      ...prev,
      {
        name: '',
        description: '',
        price: 0,
        duration_months: 1,
        duration_days: 30,
        plan_type: 'regular',
        features: DEFAULT_MEMBERSHIP_FEATURES,
        is_popular: false,
        is_active: true,
        max_freeze_days: 0,
        registration_fee: 0,
        cancellation_fee: 0,
        auto_renewal: true,
        min_commitment_months: 1
      }
    ]));
  };

  const removeMembershipPlan = (index: number) => {
    setMembershipPlans(prev => prev.filter((_, i) => i !== index));
  };

  const updateMembershipPlan = (index: number, field: string, value: any) => {
    setMembershipPlans(prev => prev.map((plan, i) => 
      i === index ? { ...plan, [field]: value } : plan
    ));
  };

  const addFeatureToMembershipPlan = (planIndex: number) => {
    setMembershipPlans(prev => prev.map((plan, i) => 
      i === planIndex ? { ...plan, features: [...plan.features, { name: '', included: false, description: '' }] } : plan
    ));
  };

  const removeFeatureFromMembershipPlan = (planIndex: number, featureIndex: number) => {
    setMembershipPlans(prev => prev.map((plan, i) => 
      i === planIndex ? { 
        ...plan, 
        features: plan.features.filter((_, fi) => fi !== featureIndex) 
      } : plan
    ));
  };

  const updateMembershipPlanFeature = (planIndex: number, featureIndex: number, value: string) => {
    setMembershipPlans(prev => prev.map((plan, i) => 
      i === planIndex ? { 
        ...plan, 
        features: plan.features.map((feature, fi) => fi === featureIndex ? { ...feature, name: value } : feature) 
      } : plan
    ));
  };

  const renderOperatingHours = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Operating Hours</h2>
      <p className="text-sm text-gray-500">Set your gym's operating hours and optional women-only hours</p>
      
      <div className="space-y-6">
        {operatingHours.map((hours, index) => (
          <div key={hours.day} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium capitalize">{hours.day}</h3>
              <Switch
                checked={hours.open !== ''}
                onCheckedChange={(checked) => {
                  setOperatingHours(prev => prev.map((h, i) => 
                    i === index ? {
                      ...h,
                      open: checked ? '06:00' : '',
                      close: checked ? '22:00' : '',
                      women_only_start: '',
                      women_only_end: ''
                    } : h
                  ));
                }}
              />
            </div>

            {hours.open !== '' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Opening Time</Label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => {
                        setOperatingHours(prev => prev.map((h, i) =>
                          i === index ? { ...h, open: e.target.value } : h
                        ));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Closing Time</Label>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => {
                        setOperatingHours(prev => prev.map((h, i) =>
                          i === index ? { ...h, close: e.target.value } : h
                        ));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Women-Only Hours</Label>
                      <p className="text-sm text-gray-500">Set dedicated hours for women</p>
                    </div>
                    <Switch
                      checked={!!hours.women_only_start}
                      onCheckedChange={(checked) => {
                        setOperatingHours(prev => prev.map((h, i) =>
                          i === index ? {
                            ...h,
                            women_only_start: checked ? '09:00' : '',
                            women_only_end: checked ? '12:00' : ''
                          } : h
                        ));
                      }}
                    />
                  </div>

                  {hours.women_only_start && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={hours.women_only_start}
                          onChange={(e) => {
                            setOperatingHours(prev => prev.map((h, i) =>
                              i === index ? { ...h, women_only_start: e.target.value } : h
                            ));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={hours.women_only_end}
                          onChange={(e) => {
                            setOperatingHours(prev => prev.map((h, i) =>
                              i === index ? { ...h, women_only_end: e.target.value } : h
                            ));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAmenities = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Amenities</h2>
      <p className="text-sm text-gray-500">Add amenities available at your gym</p>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={amenityInput}
            onChange={(e) => handleAmenityInputChange(e.target.value)}
            placeholder="Enter amenity"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAmenity();
              }
            }}
          />
          <Button type="button" onClick={handleAddAmenityClick}>Add</Button>
        </div>

        {suggestedAmenities.length > 0 && (
          <div className="space-y-2">
            <Label>Suggested Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedAmenities.map((amenity) => (
                <Button
                  key={amenity}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleSuggestedAmenityClick(amenity)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {amenity}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Added Amenities</Label>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.filter(a => a.trim()).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1 px-2">
                {amenity}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      amenities: prev.amenities.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembershipPlans = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Membership Plans</h3>
        <p className="text-sm text-gray-600">Set up membership packages for your gym</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Membership Plans</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMembershipPlan}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
        
        {membershipPlans.map((plan, planIndex) => (
          <div key={planIndex} className="space-y-4 border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plan Name *</Label>
                    <Input
                      placeholder="e.g., Basic, Premium, Elite"
                      value={plan.name}
                      onChange={(e) => updateMembershipPlan(planIndex, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Monthly Price *</Label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={plan.price}
                      onChange={(e) => updateMembershipPlan(planIndex, 'price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (Months) *</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={plan.duration_months}
                      onChange={(e) => updateMembershipPlan(planIndex, 'duration_months', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Minimum Commitment (Months)</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={plan.min_commitment_months}
                      onChange={(e) => updateMembershipPlan(planIndex, 'min_commitment_months', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Registration Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={plan.registration_fee}
                      onChange={(e) => updateMembershipPlan(planIndex, 'registration_fee', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Cancellation Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={plan.cancellation_fee}
                      onChange={(e) => updateMembershipPlan(planIndex, 'cancellation_fee', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Freeze Days</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={plan.max_freeze_days}
                      onChange={(e) => updateMembershipPlan(planIndex, 'max_freeze_days', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={plan.auto_renewal}
                      onCheckedChange={(checked) => updateMembershipPlan(planIndex, 'auto_renewal', checked)}
                    />
                    <Label>Auto Renewal</Label>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of this plan"
                    value={plan.description}
                    onChange={(e) => updateMembershipPlan(planIndex, 'description', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <Switch
                          checked={feature.included}
                          onCheckedChange={(checked) => {
                            const newFeatures = [...plan.features];
                            newFeatures[featureIndex] = { ...feature, included: checked };
                            updateMembershipPlan(planIndex, 'features', newFeatures);
                          }}
                        />
                        <Label>{feature.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {membershipPlans.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMembershipPlan(planIndex)}
                  className="ml-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <p className="text-sm text-gray-600">Let's start with the gym's basic details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Gym Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., FitZone Gym"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="area">Area *</Label>
                <Input
                  id="area"
                  placeholder="e.g., Gulshan, Dhanmondi"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Complete address with landmarks"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description about the gym"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Camera className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Images & Amenities</h3>
              <p className="text-sm text-gray-600">Add photos and amenities to showcase your gym</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Gym Images</Label>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Gym Amenities</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addAmenity()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Amenity
                </Button>
              </div>
              
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., Swimming Pool, Sauna, Personal Training"
                    value={amenity}
                    onChange={(e) => updateAmenity(index, e.target.value)}
                  />
                  {formData.amenities.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAmenity(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return renderOperatingHours();

      case 4:
        return renderAmenities();

      case 5:
        return renderMembershipPlans();

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Review & Submit</h3>
              <p className="text-sm text-gray-600">Please review the information before submitting</p>
            </div>
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">Gym Name</Label>
                <p className="text-sm">{formData.name || 'Not specified'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Location</Label>
                <p className="text-sm">{formData.area}, {formData.city}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Contact</Label>
                <p className="text-sm">
                  {formData.phone && `Phone: ${formData.phone}`}
                  {formData.phone && formData.email && ' | '}
                  {formData.email && `Email: ${formData.email}`}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="flex gap-2 mt-1">
                  <Badge variant={formData.is_verified ? 'default' : 'outline'}>
                    {formData.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant={formData.is_active ? 'default' : 'destructive'}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              {formData.images.filter(img => img.trim()).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Images</Label>
                  <p className="text-sm">{formData.images.filter(img => img.trim()).length} image(s) added</p>
                </div>
              )}

              {formData.amenities.filter(amenity => amenity.trim()).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Amenities</Label>
                  <p className="text-sm">{formData.amenities.filter(amenity => amenity.trim()).join(', ')}</p>
                </div>
              )}

              {membershipPlans.filter(plan => plan.name.trim()).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Membership Plans</Label>
                  <div className="space-y-2 mt-1">
                    {membershipPlans.filter(plan => plan.name.trim()).map((plan, index) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{plan.name}</span>
                        <span>৳{plan.price.toLocaleString()}/{plan.duration_months}mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {createUserAccount && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Gym Owner Account</Label>
                  <div className="space-y-1 mt-1">
                    <p className="text-sm">Name: {userData.name || 'Not specified'}</p>
                    <p className="text-sm">Email: {userData.email || 'Not specified'}</p>
                    <p className="text-sm">Phone: {userData.phone || 'Not specified'}</p>
                    <p className="text-sm">Role: Gym Owner</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Settings className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Settings</h3>
              <p className="text-sm text-gray-600">Configure additional settings for your gym</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Gym Owner Account</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateUserAccount(true)}>
                  {createUserAccount ? 'Remove Account' : 'Add Account'}
                </Button>
              </div>
              
              {createUserAccount && (
                <div className="space-y-1">
                  <Input
                    placeholder="Name"
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    value={userData.email}
                    onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={userData.phone}
                    onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Location"
                    value={userData.location}
                    onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <Input
                    placeholder="Gender"
                    value={userData.gender}
                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 8:
        return createUserAccount ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Gym Owner Account Created</h3>
              <p className="text-sm text-gray-600">Your gym owner account has been successfully created</p>
            </div>
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-700">Name</Label>
                <p className="text-sm">{userData.name || 'Not specified'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <p className="text-sm">{userData.email || 'Not specified'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <p className="text-sm">{userData.phone || 'Not specified'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Location</Label>
                <p className="text-sm">{userData.location || 'Not specified'}</p>
              </div>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create New Gym</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2 flex-shrink-0">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-2">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between flex-shrink-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Gym
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGymWizard;

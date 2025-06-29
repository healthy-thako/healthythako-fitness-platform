import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGigById, useGigByIdForTrainer } from '@/hooks/useGigsCRUD';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  Clock, 
  MessageSquare, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Check,
  Shield,
  RefreshCw,
  Users,
  Award,
  Calendar,
  Camera,
  PlayCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const GigDetail = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Try to load gig for trainer preview first, fallback to public view
  const { data: trainerGig, isLoading: isTrainerLoading, error: trainerError } = useGigByIdForTrainer(gigId || '');
  const { data: publicGig, isLoading: isPublicLoading, error: publicError } = useGigById(gigId || '');
  
  // Use trainer data if available, otherwise use public data
  const gig = trainerGig || publicGig;
  const isLoading = isTrainerLoading || isPublicLoading;
  const error = trainerError && publicError;
  
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="text-center py-16">
            <CardContent>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Service not found</h3>
              <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
              <Link to="/browse-services">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleOrder = () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    
    // Navigate to service booking flow with gig data
    const searchParams = new URLSearchParams({
      gig: gig.id,
      package: selectedPackage,
      price: selectedPackageData.price.toString(),
      delivery_days: selectedPackageData.deliveryDays.toString()
    });
    
    navigate(`/service-booking?${searchParams.toString()}`);
  };

  const handleMessage = () => {
    if (!user) {
      toast.error('Please login to message trainers');
      return;
    }
    toast.success('Messaging functionality coming soon!');
  };

  // Handle JSON fields safely
  const images = Array.isArray(gig.images) ? gig.images : [];
  const tags = Array.isArray(gig.tags) ? gig.tags : [];
  const faqItems = Array.isArray(gig.faq) 
    ? gig.faq.map((item: any) => ({
        question: typeof item === 'object' && item !== null ? item.question || '' : '',
        answer: typeof item === 'object' && item !== null ? item.answer || '' : ''
      }))
    : [];
  const languages = Array.isArray(gig.trainer_profiles?.languages) ? gig.trainer_profiles.languages : ['English'];

  const packages = [
    {
      type: 'basic' as const,
      name: 'Basic',
      price: gig.basic_price,
      description: gig.basic_description || 'Basic training package',
      deliveryDays: gig.basic_delivery_days || 7,
      features: ['1 session per week', 'Basic workout plan', 'Email support'],
      color: 'green'
    },
    ...(gig.standard_price ? [{
      type: 'standard' as const,
      name: 'Standard',
      price: gig.standard_price,
      description: gig.standard_description || 'Standard training package',
      deliveryDays: gig.standard_delivery_days || 5,
      features: ['2 sessions per week', 'Detailed workout plan', 'Nutrition guidance', 'Priority support'],
      color: 'blue'
    }] : []),
    ...(gig.premium_price ? [{
      type: 'premium' as const,
      name: 'Premium',
      price: gig.premium_price,
      description: gig.premium_description || 'Premium training package',
      deliveryDays: gig.premium_delivery_days || 3,
      features: ['Daily sessions', 'Personalized meal plan', '24/7 support', 'Progress tracking', 'Video calls'],
      color: 'purple'
    }] : [])
  ];

  const selectedPackageData = packages.find(p => p.type === selectedPackage) || packages[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Container with proper margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Services', href: '/browse-services' },
            { label: gig.category || 'Service' },
            { label: gig.title, current: true }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Title & Trainer Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {gig.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-14 w-14 ring-2 ring-purple-100">
                  <AvatarImage src={gig.trainer_profiles?.profile_image} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {gig.profiles?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {gig.profiles?.name || 'Professional Trainer'}
                  </h3>
                  <p className="text-gray-600 text-sm">{gig.profiles?.location || 'Available Online'}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium ml-2">4.9</span>
                    <span className="text-sm text-gray-500 ml-1">(24 reviews)</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {gig.category}
                </Badge>
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Service Images */}
            {images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="relative">
                  <img
                    src={images[selectedImageIndex]}
                    alt={`${gig.title} ${selectedImageIndex + 1}`}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => setSelectedImageIndex((prev) => 
                          prev === 0 ? images.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => setSelectedImageIndex((prev) => 
                          prev === images.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="p-4 border-t bg-gray-50">
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex space-x-3">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === selectedImageIndex 
                                ? 'border-purple-500' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {/* Service Details Tabs */}
            <div className="bg-white rounded-xl shadow-sm border">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-t-xl">
                  <TabsTrigger value="description" className="text-sm">Description</TabsTrigger>
                  <TabsTrigger value="about" className="text-sm">About Trainer</TabsTrigger>
                  <TabsTrigger value="faq" className="text-sm">FAQ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="p-6 pt-4">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {gig.description}
                    </p>
                    
                    {gig.requirements && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">What I need from you</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {gig.requirements}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="about" className="p-6 pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-medium">{gig.trainer_profiles?.experience_years || 0} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response time</span>
                        <span className="font-medium">Within 1 hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Languages</span>
                        <span className="font-medium">{languages.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specializations</span>
                        <span className="font-medium">
                          {Array.isArray(gig.trainer_profiles?.specializations) 
                            ? gig.trainer_profiles.specializations.slice(0, 2).join(', ')
                            : 'Fitness Training'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {gig.trainer_profiles?.bio && (
                      <div className="pt-4 border-t">
                        <p className="text-gray-700 leading-relaxed">
                          {gig.trainer_profiles.bio}
                        </p>
                      </div>
                    )}

                    <Link to={`/trainer/${gig.trainer_profiles?.user_id}`} className="block pt-4">
                      <Button variant="outline" className="w-full">
                        View Full Trainer Profile
                      </Button>
                    </Link>
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="p-6 pt-4">
                  {faqItems.length > 0 ? (
                    <div className="space-y-4">
                      {faqItems.map((item, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">No FAQ available yet.</p>
                      <p className="text-xs mt-1">Contact the trainer for specific questions.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar - Pricing & Actions */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-6 shadow-lg border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Choose a Package</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Package Selector */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.type}
                      onClick={() => setSelectedPackage(pkg.type)}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                        selectedPackage === pkg.type
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {pkg.name}
                    </button>
                  ))}
                </div>

                {/* Selected Package Details */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">৳{selectedPackageData.price}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600">{selectedPackageData.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{selectedPackageData.deliveryDays} days delivery</span>
                  </div>

                  {/* Package Features */}
                  <div className="space-y-2 pt-2">
                    {selectedPackageData.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t">
                  <Button 
                    onClick={handleOrder}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3"
                  >
                    Continue (৳{selectedPackageData.price})
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleMessage}
                    className="w-full border-gray-300"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Trainer
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="space-y-1">
                      <RefreshCw className="h-5 w-5 text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-600">Money back</p>
                    </div>
                    <div className="space-y-1">
                      <Award className="h-5 w-5 text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-600">Quality assured</p>
                    </div>
                    <div className="space-y-1">
                      <Users className="h-5 w-5 text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-600">Expert trainers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Service Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{gig.view_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orders</span>
                  <span className="font-medium">{gig.order_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GigDetail;

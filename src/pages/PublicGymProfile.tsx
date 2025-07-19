import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGymMembershipPayment } from '@/hooks/useUddoktapayPayment';
import { useFallbackGymDetails } from '@/hooks/useFallbackGymDetails';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FallbackDebugPanel from '@/components/FallbackDebugPanel';
import { ArrowLeft, MapPin, Star, Phone, Mail, Clock, Heart, Share2, Users, CheckCircle, Dumbbell, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Gym {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_time: string;
  closing_time: string;
  monthly_price: number;
  daily_price: number;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  review_count: number;
  images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
  amenities?: string[];
  hours?: Array<{
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>;
  membership_plans?: MembershipPlan[];
}

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  is_active: boolean;
}

const PublicGymProfile = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const gymMembershipPayment = useGymMembershipPayment();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Use fallback hook for immediate data loading
  const { data: gymData, isLoading: loading, error, isUsingFallback } = useFallbackGymDetails(gymId || '');

  // Extract data from the hook result
  const gym = gymData;
  const membershipPlans = gymData?.membership_plans || [];
  const reviews: any[] = []; // Reviews will be handled separately

  // Log gym data for debugging
  useEffect(() => {
    if (gymData) {
      console.log('PublicGymProfile - Gym Data:', gymData);
    }
    if (error) {
      console.error('Error loading gym:', error);
    }
  }, [gymData, error]);



  const handleJoinGym = async (planId?: string) => {
    if (!user) {
      toast.error('Please sign in to join this gym');
      navigate('/auth');
      return;
    }

    if (!gym) return;

    try {
      const selectedPlan = planId ? membershipPlans.find(p => p.id === planId) : null;
      const amount = selectedPlan ? selectedPlan.price : gym.monthly_price;
      const duration_days = selectedPlan ? selectedPlan.duration_days : 30;

      // Check if user is already a member
      const { data: existingMembership, error: checkError } = await supabase
        .from('gym_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('gym_id', gym.id)
        .eq('is_active', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing membership:', checkError);
        toast.error('Failed to check membership status');
        return;
      }

      if (existingMembership) {
        toast.error('You are already a member of this gym');
        return;
      }

      // Use the new gym membership payment hook for better error handling
      await gymMembershipPayment.createPayment({
        gymId: gym.id,
        gymName: gym.name,
        planId: planId || 'monthly',
        planName: selectedPlan?.name || 'Monthly Membership',
        amount: amount,
        durationDays: duration_days,
        customerName: user.user_metadata?.name || 'Customer',
        customerEmail: user.email || 'customer@example.com'
      });

    } catch (error) {
      console.error('Error joining gym:', error);
      toast.error('Failed to join gym. Please try again.');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: gym?.name,
        text: `Check out ${gym?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Gym Not Found</h1>
            <Button onClick={() => navigate('/gym-membership')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gyms
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/gym-membership')}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gyms
          </Button>
          
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFavorite}
              className={isFavorited ? 'text-red-500 border-red-200' : ''}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fallback Data Notice */}
        {isUsingFallback && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800">Demo Gym Profile</h4>
                <p className="text-xs text-blue-600 mt-1">
                  Currently showing sample gym information due to connectivity issues.
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-2 underline hover:no-underline"
                  >
                    Try refreshing
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="overflow-hidden">
              <div className="h-48 sm:h-64 relative">
                {gym.images && gym.images.length > 0 ? (
                  <img
                    src={gym.images.find(img => img.is_primary)?.image_url || gym.images[0]?.image_url}
                    alt={gym.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient background if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-pink-50', 'to-rose-100');
                      const fallback = document.createElement('div');
                      fallback.className = 'flex items-center justify-center h-full';
                      fallback.innerHTML = '<span class="text-6xl">🏋️</span>';
                      e.currentTarget.parentElement!.appendChild(fallback);
                    }}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-100 h-full flex items-center justify-center">
                    <span className="text-6xl">🏋️</span>
                  </div>
                )}

                {gym.is_verified && (
                  <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{gym.name}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-pink-600" />
                        <span>{gym.area}, {gym.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{gym.rating.toFixed(1)} ({gym.review_count} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-600">৳{gym.monthly_price.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-sm text-gray-600">৳{gym.daily_price}/day</div>
                  </div>
                </div>

                {gym.description && (
                  <p className="text-gray-700 mb-4">{gym.description}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{gym.opening_time} - {gym.closing_time}</span>
                  </div>
                  {gym.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{gym.phone}</span>
                    </div>
                  )}
                  {gym.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{gym.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="plans">Plans</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {gym.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Location</h4>
                        <p className="text-gray-600">{gym.address}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Operating Hours</h4>
                        <p className="text-gray-600">
                          Daily: {gym.opening_time} - {gym.closing_time}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Facilities</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['Cardio Equipment', 'Weight Training', 'Locker Rooms', 'Shower Facilities', 'Free WiFi', 'Parking'].map((facility) => (
                            <div key={facility} className="flex items-center gap-2">
                              <Dumbbell className="h-4 w-4 text-pink-600" />
                              <span className="text-sm">{facility}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="plans" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Default monthly plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Membership</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-pink-600 mb-2">
                        ৳{gym.monthly_price.toLocaleString()}
                      </div>
                      <p className="text-gray-600 mb-4">Full access to all facilities</p>
                      <Button onClick={() => handleJoinGym()} className="w-full">
                        Join Now
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Custom membership plans */}
                  {membershipPlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-pink-600 mb-2">
                          ৳{plan.price.toLocaleString()}
                        </div>
                        <p className="text-gray-600 mb-2">{plan.description}</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {plan.duration_days} days validity
                        </p>
                        <Button onClick={() => handleJoinGym(plan.id)} className="w-full">
                          Choose Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews ({reviews.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-600">Be the first to review this gym!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-semibold">{review.profiles.name}</span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleJoinGym()} 
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Join Gym - ৳{gym.monthly_price.toLocaleString()}
                </Button>
                
                {gym.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`tel:${gym.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const address = `${gym.address}, ${gym.area}, ${gym.city}`;
                    window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                  <div>
                    <p className="font-medium">{gym.area}</p>
                    <p className="text-sm text-gray-600">{gym.address}</p>
                    <p className="text-sm text-gray-600">{gym.city}</p>
                  </div>
                </div>
                
                {gym.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{gym.phone}</span>
                  </div>
                )}
                
                {gym.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{gym.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{gym.opening_time} - {gym.closing_time}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Debug Panel */}
      <FallbackDebugPanel
        isVisible={showDebugPanel}
        onToggle={() => setShowDebugPanel(!showDebugPanel)}
        gymsData={{
          data: gym ? [gym] : [],
          isLoading: loading,
          error,
          isUsingFallback
        }}
      />
    </div>
  );
};

export default PublicGymProfile;

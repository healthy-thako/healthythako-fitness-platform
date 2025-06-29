
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGymMembershipPlans } from '@/hooks/useGymMembershipPlans';
import { useGymReviews } from '@/hooks/useGymReviews';
import { ArrowLeft, MapPin, Star, Phone, Mail, Globe, Clock, Heart, Share2, Users, CheckCircle, ExternalLink, Wifi, Car, Droplets, Dumbbell, Wind, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Gym } from '@/hooks/useGyms';

interface GymProfileModalProps {
  gym: Gym | null;
  isOpen: boolean;
  onClose: () => void;
}

const GymProfileModal: React.FC<GymProfileModalProps> = ({
  gym,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  
  const { data: membershipPlans } = useGymMembershipPlans(gym?.id);
  const { data: reviews } = useGymReviews(gym?.id || '');

  if (!gym) return null;

  const formatOpeningHours = (operatingHours: any) => {
    if (!operatingHours || typeof operatingHours !== 'object') return 'Hours not available';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = operatingHours[today];
    
    if (todayHours && todayHours !== 'Closed') {
      return `Today: ${todayHours}`;
    }
    
    return 'Closed today';
  };

  const handleJoinGym = (planId: string) => {
    navigate(`/booking-flow?gym=${gym.id}&plan=${planId}`);
    onClose();
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: gym.name,
        text: `Check out ${gym.name} - ${gym.description}`,
        url: `${window.location.origin}/gym/${gym.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/gym/${gym.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const handleViewFullPage = () => {
    navigate(`/gym/${gym.id}`);
    onClose();
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes('parking')) return <Car className="h-4 w-4" />;
    if (amenityLower.includes('shower')) return <Droplets className="h-4 w-4" />;
    if (amenityLower.includes('ac') || amenityLower.includes('air')) return <Wind className="h-4 w-4" />;
    if (amenityLower.includes('locker')) return <ShieldCheck className="h-4 w-4" />;
    return <Dumbbell className="h-4 w-4" />;
  };

  // Mock amenities data since it's not in the database
  const amenities = gym.amenities?.length > 0 ? gym.amenities : [
    'Free WiFi',
    'Parking Available', 
    'Shower Facilities',
    'Air Conditioning',
    'Locker Rooms',
    'Personal Training',
    'Group Classes',
    'Cardio Equipment'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] overflow-hidden p-0 bg-white">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900">{gym.name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={`hover:bg-gray-50 ${isFavorited ? 'text-red-500 border-red-200' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="hover:bg-gray-50">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleViewFullPage} className="hover:bg-gray-50">
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Full Page</span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-gray-600 mt-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pink-600" />
                <span className="text-sm">{gym.area}, {gym.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-sm">{gym.rating}</span>
                <span className="text-sm">({gym.review_count} reviews)</span>
              </div>
              {gym.is_verified && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Hero Image */}
                  <div className="h-48 sm:h-64 bg-gradient-to-br from-pink-50 to-rose-100 relative overflow-hidden rounded-xl">
                    {gym.images && gym.images.length > 0 ? (
                      <img
                        src={gym.images[0]}
                        alt={gym.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-4xl text-pink-600">🏋️</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {gym.description && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold mb-3 text-gray-900">About This Gym</h3>
                      <p className="text-gray-600 leading-relaxed">{gym.description}</p>
                    </div>
                  )}

                  {/* Amenities */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-pink-600" />
                      Amenities & Facilities
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                          <div className="text-pink-600">
                            {getAmenityIcon(amenity)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 text-gray-900">Contact Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock className="h-4 w-4 text-pink-600" />
                        <span className="text-sm">{formatOpeningHours(gym.operating_hours)}</span>
                      </div>
                      
                      {gym.phone && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="h-4 w-4 text-pink-600" />
                          <span className="text-sm">{gym.phone}</span>
                        </div>
                      )}
                      
                      {gym.email && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="h-4 w-4 text-pink-600" />
                          <span className="text-sm">{gym.email}</span>
                        </div>
                      )}
                      
                      {gym.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-pink-600" />
                          <a 
                            href={gym.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-pink-600 hover:text-pink-700 text-sm hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Membership Plans */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 text-gray-900">Membership Plans</h3>
                    
                    {membershipPlans && membershipPlans.length > 0 ? (
                      <div className="space-y-4">
                        {membershipPlans.filter(plan => plan.is_active).slice(0, 2).map((plan) => (
                          <Card key={plan.id} className={`transition-all hover:shadow-md ${plan.is_popular ? 'border-pink-600 bg-pink-50' : 'border-gray-200'}`}>
                            {plan.is_popular && (
                              <div className="bg-pink-600 text-white text-center py-1 text-xs font-medium rounded-t-lg">
                                Most Popular
                              </div>
                            )}
                            
                            <CardContent className="p-4">
                              <div className="text-center mb-4">
                                <h4 className="font-bold text-gray-900">{plan.name}</h4>
                                <div className="text-2xl font-bold text-pink-600 mt-2">৳{plan.price?.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">{plan.duration_months} month(s)</div>
                              </div>
                              
                              <Button
                                onClick={() => handleJoinGym(plan.id)}
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                                size="sm"
                              >
                                Join Now
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {membershipPlans.length > 2 && (
                          <Button
                            variant="outline"
                            onClick={handleViewFullPage}
                            className="w-full text-pink-600 border-pink-600 hover:bg-pink-50"
                            size="sm"
                          >
                            View All Plans
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p className="text-sm mb-2">No membership plans available</p>
                        <p className="text-xs">Contact the gym directly</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-100 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 text-gray-900">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        onClick={() => membershipPlans && membershipPlans.length > 0 && handleJoinGym(membershipPlans[0].id)}
                        disabled={!membershipPlans || membershipPlans.length === 0}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Join Gym
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-gray-50" 
                        onClick={() => gym.phone && window.open(`tel:${gym.phone}`)}
                        disabled={!gym.phone}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </div>

                  {/* Reviews Summary */}
                  {reviews && reviews.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl p-6">
                      <h3 className="font-semibold mb-4 text-gray-900">Recent Reviews</h3>
                      <div className="space-y-4">
                        {reviews.slice(0, 2).map((review) => (
                          <div key={review.id} className="border-l-4 border-pink-200 pl-4">
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                            <p className="text-xs text-gray-500 mt-1">- {review.user?.name || 'Anonymous'}</p>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={handleViewFullPage}
                          className="w-full text-pink-600 border-pink-600 hover:bg-pink-50"
                          size="sm"
                        >
                          View All Reviews
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GymProfileModal;

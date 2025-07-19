import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Heart, Clock, Wifi, Car, Droplets, CheckCircle, CreditCard, ArrowRight, Eye } from 'lucide-react';
import { Gym } from '@/hooks/useGyms';
import { useGymMembershipPlans } from '@/hooks/useGymMembershipPlans';

interface GymCardProps {
  gym: Gym;
  onJoinClick: (gym: Gym) => void;
  onViewDetails: (gym: Gym) => void;
  onFavorite: (gymId: string) => void;
  isFavorited?: boolean;
}

const GymCard: React.FC<GymCardProps> = ({
  gym,
  onJoinClick,
  onViewDetails,
  onFavorite,
  isFavorited = false
}) => {
  const navigate = useNavigate();
  const { data: membershipPlans } = useGymMembershipPlans(gym.id);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi':
        return <Wifi className="h-3 w-3" />;
      case 'parking':
        return <Car className="h-3 w-3" />;
      case 'shower':
        return <Droplets className="h-3 w-3" />;
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getOpeningHours = () => {
    if (gym.operating_hours && typeof gym.operating_hours === 'object') {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      return gym.operating_hours[today] || gym.operating_hours.monday || '6:00 AM - 10:00 PM';
    }
    return '6:00 AM - 10:00 PM';
  };

  // Get the cheapest membership plan for display
  const cheapestPlan = membershipPlans?.sort((a, b) => a.price - b.price)[0];

  // Use amenities from gym data or fallback to mock data
  const amenities = gym.amenities?.length > 0 ? gym.amenities : ['Free WiFi', 'Parking', 'Shower'];

  const handleViewProfile = () => {
    navigate(`/gym/${gym.id}`);
  };

  return (
    <Card
      className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 h-full flex flex-col transform hover:-translate-y-0.5 sm:hover:-translate-y-1 cursor-pointer"
      onClick={handleViewProfile}
    >
      {/* Favorite Heart */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onFavorite(gym.id);
        }}
        className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1.5 sm:p-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full transition-all duration-300 ${
          isFavorited ? 'text-red-500 hover:text-red-600 bg-white shadow-lg' : 'text-gray-400 hover:text-red-500 bg-white/80 backdrop-blur-sm'
        }`}
      >
        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorited ? 'fill-current' : ''}`} />
      </Button>

      {/* Gym Image */}
      <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden cursor-pointer" onClick={handleViewProfile}>
        <img
          src={gym.image_url || gym.images?.[0]?.url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'}
          alt={gym.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Verified Badge */}
        {gym.is_verified && (
          <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 text-white border-0 shadow-lg text-xs">
            <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            Verified
          </Badge>
        )}

        {/* View Profile Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button 
            variant="outline" 
            className="bg-white/90 backdrop-blur-sm border-gray-200 text-gray-900 hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            View Profile
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle 
              className="text-base sm:text-lg font-bold text-gray-900 truncate cursor-pointer hover:text-[#8b1538] transition-colors"
              onClick={handleViewProfile}
            >
              {gym.name}
            </CardTitle>
            <div className="flex items-center mt-1 text-gray-600">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{gym.area}, {gym.city}</span>
            </div>
          </div>
          
          <div className="flex items-center ml-2 bg-yellow-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
            <span className="font-semibold text-xs sm:text-sm">{gym.rating}</span>
            <span className="text-gray-500 text-xs ml-1">({gym.review_count})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 sm:p-6 pt-0">
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-shrink-0">
          {gym.description}
        </p>
        
        {/* Opening Hours */}
        <div className="flex items-center mb-2 sm:mb-3 text-gray-600 bg-gray-50 rounded-lg p-2">
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-2 flex-shrink-0 text-[#8b1538]" />
          <span className="text-xs font-medium">{getOpeningHours()}</span>
        </div>
        
        {/* Amenities */}
        <div className="mb-3 sm:mb-4 flex-shrink-0">
          <h4 className="font-medium text-gray-900 mb-1.5 sm:mb-2 text-xs sm:text-sm">Amenities</h4>
          <div className="flex flex-wrap gap-1">
            {amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 border-blue-200">
                {getAmenityIcon(amenity)}
                <span className="ml-1 truncate">{amenity}</span>
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border-gray-300">
                +{amenities.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Membership Plans */}
        <div className="mb-3 sm:mb-4 flex-shrink-0">
          {cheapestPlan ? (
            <div className="bg-gradient-to-r from-[#8b1538]/5 to-purple-50 rounded-lg p-2 sm:p-3 border border-[#8b1538]/10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-[#8b1538]" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Membership Plans</span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-[#8b1538] text-lg sm:text-xl">৳{Number(cheapestPlan.price).toLocaleString()}</span>
                <span className="text-xs sm:text-sm text-gray-500">/{cheapestPlan.duration_months}mo</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">Starting from</span>
                {membershipPlans && membershipPlans.length > 1 && (
                  <span className="text-xs text-[#8b1538] font-medium">+{membershipPlans.length - 1} more plans</span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#8b1538]/5 to-purple-50 rounded-lg p-2 sm:p-3 border border-[#8b1538]/10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-[#8b1538]" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Membership Available</span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-[#8b1538] text-lg sm:text-xl">৳3,000</span>
                <span className="text-xs sm:text-sm text-gray-500">/month</span>
              </div>
              <span className="text-xs text-gray-400">Starting from</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-1.5 sm:space-y-2 mt-auto">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onJoinClick(gym);
            }}
            className="w-full bg-gradient-to-r from-[#8b1538] to-[#6b1029] hover:from-[#6b1029] hover:to-[#4a0a1d] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Join Now
          </Button>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
              className="border-gray-300 hover:border-[#8b1538] hover:text-[#8b1538] hover:bg-[#8b1538]/5 transition-all duration-300"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(gym);
              }}
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GymCard;

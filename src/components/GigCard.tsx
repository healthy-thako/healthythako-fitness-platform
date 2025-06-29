import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, User, CheckCircle } from 'lucide-react';

interface GigCardProps {
  gig: {
    id: string;
    title: string;
    description: string;
    basic_price: number;
    basic_delivery_days?: number;
    category?: string;
    view_count?: number;
    order_count?: number;
    images?: string[];
    trainer_profiles?: {
      profile_image?: string;
      experience_years?: number;
      is_verified?: boolean;
    };
    profiles?: {
      name?: string;
      location?: string;
    };
  };
  linkTo?: string;
}

const GigCard: React.FC<GigCardProps> = ({ gig, linkTo = `/gig/${gig.id}` }) => {
  const images = Array.isArray(gig.images) ? gig.images : [];
  const trainerProfile = gig.trainer_profiles;
  const profile = gig.profiles;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Gig Image */}
      {images.length > 0 && (
        <div className="h-40 sm:h-48 overflow-hidden">
          <img
            src={images[0]}
            alt={gig.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <CardHeader className="pb-2 p-3 sm:p-6">
        {/* Trainer Info */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
          <img
            src={trainerProfile?.profile_image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop'}
            alt={profile?.name || 'Trainer'}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {profile?.name || 'Unknown Trainer'}
            </p>
            <p className="text-xs text-gray-500">
              {profile?.location || 'Location not specified'}
            </p>
          </div>
          {trainerProfile?.is_verified && (
            <div className="flex items-center">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            </div>
          )}
        </div>

        <CardTitle className="text-sm sm:text-lg line-clamp-2">{gig.title}</CardTitle>
        
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {gig.category}
          </Badge>
          {trainerProfile?.experience_years && (
            <Badge variant="outline" className="text-xs">
              {trainerProfile.experience_years}y exp
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 pt-0">
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
          {gig.description}
        </p>

        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-xs sm:text-sm font-medium">4.9</span>
            <span className="text-xs sm:text-sm text-gray-500 ml-1">(24)</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            {gig.basic_delivery_days || 3} days
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-base sm:text-lg font-bold text-green-600">৳{gig.basic_price}</span>
            <span className="text-xs sm:text-sm text-gray-600"> starting</span>
          </div>
          <Link to={linkTo}>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
              View Details
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
          <span>{gig.view_count || 0} views</span>
          <span>{gig.order_count || 0} orders</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GigCard;

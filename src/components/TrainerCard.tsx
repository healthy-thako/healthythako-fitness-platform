
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Award, Verified } from 'lucide-react';

interface TrainerCardProps {
  trainer: {
    id: string;
    name: string;
    image?: string;
    specialization?: string;
    location?: string;
    rating?: number;
    rate_per_hour?: number;
    experience_years?: number;
    trainer_profile?: {
      specializations?: string[];
      rate_per_hour?: number;
      location?: string;
      is_verified?: boolean;
      profile_image?: string;
    };
  };
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer }) => {
  const specializations = trainer.trainer_profile?.specializations || [trainer.specialization].filter(Boolean);
  const rate = trainer.trainer_profile?.rate_per_hour || trainer.rate_per_hour || 800;
  const location = trainer.trainer_profile?.location || trainer.location || 'Dhaka';
  const isVerified = trainer.trainer_profile?.is_verified || false;
  const profileImage = trainer.trainer_profile?.profile_image || trainer.image;

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white rounded-3xl shadow-lg hover:scale-[1.02] hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Horizontal Layout: Image (1/3) + Content (2/3) */}
        <div className="flex h-80">
          {/* Trainer Image - Takes 1/3 of width */}
          <div className="relative w-1/3 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
            <img
              src={profileImage || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop&crop=face'}
              alt={`${trainer.name} - Personal Trainer`}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Enhanced overlay with better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
            
            {/* Rating Badge - Top Right */}
            {trainer.rating && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-xl border border-white/20">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-bold text-gray-900">{trainer.rating}</span>
                </div>
              </div>
            )}

            {/* Verified Badge - Top Left */}
            {isVerified && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full shadow-xl">
                <div className="flex items-center gap-1">
                  <Verified className="h-3 w-3" />
                  <span className="text-xs font-semibold">Verified</span>
                </div>
              </div>
            )}

            {/* Experience Badge - Bottom Left on Image */}
            {trainer.experience_years && (
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-purple-700 px-2 py-1 rounded-full shadow-xl border border-white/20">
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span className="text-xs font-bold">{trainer.experience_years}+ years</span>
                </div>
              </div>
            )}
          </div>

          {/* Trainer Info - Takes 2/3 of width */}
          <div className="w-2/3 p-6 flex flex-col justify-between">
            {/* Top Section */}
            <div className="space-y-4">
              {/* Name and Location */}
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-gray-900 leading-tight">{trainer.name}</h3>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">{location}</span>
                </div>
              </div>

              {/* Specializations */}
              {specializations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {specializations.slice(0, 2).map((spec, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 font-medium px-3 py-1 text-xs"
                    >
                      {spec}
                    </Badge>
                  ))}
                  {specializations.length > 2 && (
                    <Badge 
                      variant="outline" 
                      className="border-purple-200 text-purple-600 font-medium text-xs"
                    >
                      +{specializations.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-4">
              {/* Pricing Section */}
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">৳{rate.toLocaleString()}</span>
                      <span className="text-sm text-gray-600 font-medium">/session</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Starting from</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">Available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link to={`/trainer/${trainer.id}`} className="block w-full">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  View Profile & Book
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainerCard;

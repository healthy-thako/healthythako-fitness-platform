import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Heart, MessageSquare, CheckCircle, Award, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TrainerProfileCardProps {
  trainer: {
    id: string;
    name: string;
    email: string;
    location?: string;
    trainer_profiles?: {
      bio: string;
      profile_image?: string;
      rate_per_hour: string | number;
      experience_years: number;
      specializations: string[];
      is_verified: boolean;
      services?: any[];
      languages?: string[];
      availability?: any;
      certifications?: any[];
    };
    average_rating?: number;
    total_reviews?: number;
    completed_bookings?: number;
    active_gigs?: number;
  };
  onBook: (trainer: any) => void;
  onMessage: (trainerId: string) => void;
  onFavorite: (trainerId: string) => void;
  onViewProfile: (trainer: any) => void;
  isFavorited?: boolean;
}

const TrainerProfileCard: React.FC<TrainerProfileCardProps> = ({
  trainer,
  onBook,
  onMessage,
  onFavorite,
  onViewProfile,
  isFavorited = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = trainer.trainer_profiles;

  if (!profile) return null;

  const handleMessage = () => {
    if (!user) {
      toast.error('Please login to message trainers');
      return;
    }
    
    // Navigate to the correct dashboard messages route based on user role
    const userRole = user.user_metadata?.role || 'client';
    const dashboardRoute = userRole === 'trainer' ? '/trainer-dashboard/messages' : '/client-dashboard/messages';
    
    navigate(dashboardRoute, {
      state: {
        startConversation: true,
        trainerId: trainer.id,
        trainerName: trainer.name
      }
    });
  };

  const handleViewProfile = () => {
    navigate(`/trainer/${trainer.id}`);
  };

  const displayLocation = trainer.location || 'Dhaka';
  const displayRating = trainer.average_rating || 0;
  const displayReviews = trainer.total_reviews || 0;
  const completedSessions = trainer.completed_bookings || 0;

  return (
    <Card
      className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200 rounded-xl sm:rounded-3xl hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer"
      onClick={handleViewProfile}
    >
      {/* Favorite Heart */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onFavorite(trainer.id);
        }}
        className={`absolute top-2 sm:top-4 right-2 sm:right-4 z-10 p-1.5 sm:p-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-colors ${
          isFavorited
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-400 hover:text-red-500'
        }`}
      >
        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorited ? 'fill-current' : ''}`} />
      </Button>

      <CardContent className="p-3 sm:p-6 text-center">
        {/* Circular Profile Image Section - Made Responsive */}
        <div className="relative mb-4 sm:mb-6">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto">
            <img
              src={profile.profile_image || `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=face`}
              alt={`${trainer.name} - Personal Trainer`}
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover border-2 sm:border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
            />

            {/* Verified Badge on Image */}
            {profile.is_verified && (
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-green-500 text-white p-0.5 sm:p-1 rounded-full shadow-lg border border-white sm:border-2">
                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
              </div>
            )}

            {/* Click to view overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-900">
                <Eye className="h-3 w-3 inline mr-1" />
                View Profile
              </div>
            </div>
          </div>
          
          {/* Rating Badge */}
          {displayRating > 0 && (
            <div className="absolute -top-1 sm:-top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
              <div className="flex items-center gap-1">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                <span className="text-xs font-bold">{displayRating}</span>
              </div>
            </div>
          )}
        </div>

        {/* Trainer Info */}
        <div className="space-y-2 sm:space-y-3">
          {/* Name */}
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-tight">{trainer.name}</h3>
          
          {/* Location */}
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500" />
            <span className="text-xs sm:text-sm font-medium">{displayLocation}</span>
          </div>
          
          {/* Experience and Completed Sessions */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-pink-600">
              <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
              <span className="font-semibold">{profile.experience_years}+ years</span>
            </div>
            {completedSessions > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                <span className="font-semibold">{completedSessions} sessions</span>
              </div>
            )}
          </div>
          
          {/* Top Specialization */}
          {profile.specializations.length > 0 && (
            <Badge variant="secondary" className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-0 font-medium text-xs px-2 sm:px-3 py-0.5 sm:py-1">
              {profile.specializations[0]}
            </Badge>
          )}
          
          {/* Reviews Count */}
          {displayReviews > 0 ? (
            <p className="text-xs text-gray-500">({displayReviews} reviews)</p>
          ) : (
            <p className="text-xs text-gray-400">(New trainer)</p>
          )}
        </div>
        
        {/* Price Section */}
        <div className="bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 my-3 sm:my-4">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-lg sm:text-xl font-bold text-gray-900">৳{Number(typeof profile.rate_per_hour === 'string' ? parseFloat(profile.rate_per_hour) : profile.rate_per_hour).toLocaleString()}</span>
              <span className="text-xs text-gray-600">/hour</span>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg mt-1 sm:mt-2 text-xs">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="font-medium">Available</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-1.5 sm:space-y-2">
          {/* Primary Book Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBook(trainer);
            }}
            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
          >
            Book Now
          </Button>

          {/* Secondary Actions */}
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProfile();
              }}
              className="flex-1 border-gray-300 hover:border-pink-300 hover:bg-pink-50 rounded-lg sm:rounded-xl text-xs py-1.5 sm:py-2"
            >
              <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleMessage();
              }}
              className="flex-1 border-gray-300 hover:border-pink-300 hover:bg-pink-50 rounded-lg sm:rounded-xl text-xs py-1.5 sm:py-2"
            >
              <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainerProfileCard;

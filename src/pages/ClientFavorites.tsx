
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Heart, Star, MapPin, Clock, MessageSquare, Calendar, Filter, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientFavorites, useRemoveFromFavorites } from '@/hooks/useClientData';
import { toast } from 'sonner';

const ClientFavorites = () => {
  const [sortBy, setSortBy] = useState('recent');
  const { data: favorites, isLoading } = useClientFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const handleRemoveFavorite = async (trainerId: string) => {
    try {
      await removeFromFavorites.mutateAsync(trainerId);
      toast.success('Trainer removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
      console.error('Error removing favorite:', error);
    }
  };

  const handleBookSession = (trainerId: string) => {
    console.log('Booking session with:', trainerId);
    toast.info('Booking feature coming soon!');
  };

  const handleSendMessage = (trainerId: string) => {
    console.log('Sending message to:', trainerId);
    toast.info('Messaging feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your favorite trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <SidebarTrigger />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Favorite Trainers</h1>
              <p className="text-xs sm:text-base text-gray-600 hidden sm:block">Your saved trainers and fitness professionals</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sort by {sortBy}</span>
                <span className="sm:hidden">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Recently Added
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('rating')}>
                Highest Rating
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-low')}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-high')}>
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {favorites.map((favorite) => {
              const trainer = favorite.trainer;
              const trainerProfile = trainer?.trainer_profile;
              
              return (
                <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={trainerProfile?.profile_image || '/placeholder.svg'} 
                            alt={trainer?.name || 'Trainer'}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm sm:text-lg truncate">{trainer?.name || 'Unknown Trainer'}</CardTitle>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs sm:text-sm font-medium">4.8</span>
                            <span className="text-xs sm:text-sm text-gray-500">(24)</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(trainer?.id || '')}
                        disabled={removeFromFavorites.isPending}
                        className="text-red-500 hover:text-red-700 h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Specializations */}
                      {trainerProfile?.specializations && (
                        <div className="flex flex-wrap gap-1">
                          {trainerProfile.specializations.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {trainerProfile.specializations.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{trainerProfile.specializations.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{trainer?.location || 'Location not specified'}</span>
                      </div>

                      {/* Response Time */}
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Responds within 1 hour</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm sm:text-lg font-bold">
                          ৳{trainerProfile?.rate_per_hour || 1500}/hour
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-3">
                        <Button 
                          onClick={() => handleBookSession(trainer?.id || '')}
                          className="flex-1 mesh-gradient-overlay text-white text-xs"
                          size="sm"
                        >
                          <Calendar className="h-3 w-3 mr-2" />
                          Book Session
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendMessage(trainer?.id || '')}
                          className="sm:w-auto"
                        >
                          <MessageSquare className="h-3 w-3 sm:mr-0 mr-2" />
                          <span className="sm:hidden">Message</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No favorite trainers yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
              Start exploring trainers and add them to your favorites for quick access.
            </p>
            <Button className="mesh-gradient-overlay text-white text-sm">
              Explore Trainers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientFavorites;

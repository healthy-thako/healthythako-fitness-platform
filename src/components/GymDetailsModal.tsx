
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, Phone, Mail, Globe, Wifi, Car, Droplets } from 'lucide-react';
import { Gym } from '@/hooks/useGyms';

interface GymDetailsModalProps {
  gym: Gym | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (gym: Gym) => void;
}

const GymDetailsModal: React.FC<GymDetailsModalProps> = ({
  gym,
  isOpen,
  onClose,
  onJoin
}) => {
  if (!gym) return null;

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'free wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'shower':
        return <Droplets className="h-4 w-4" />;
      default:
        return <span className="w-4 h-4 bg-orange-600 rounded-full" />;
    }
  };

  const formatOpeningHours = (operatingHours: any) => {
    if (!operatingHours || typeof operatingHours !== 'object') return 'Hours not available';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = operatingHours[today];
    
    if (todayHours && todayHours !== 'Closed') {
      return `Today: ${todayHours}`;
    }
    
    return 'Closed today';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{gym.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          {gym.images && gym.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {gym.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${gym.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{gym.area}, {gym.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{gym.rating}</span>
                <span className="text-gray-500">({gym.review_count} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{formatOpeningHours(gym.operating_hours)}</span>
            </div>

            {gym.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{gym.phone}</span>
              </div>
            )}

            {gym.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{gym.email}</span>
              </div>
            )}

            {gym.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {gym.description && (
            <div>
              <h3 className="font-semibold mb-2">About This Gym</h3>
              <p className="text-gray-600">{gym.description}</p>
            </div>
          )}

          {/* Amenities */}
          {gym.amenities && gym.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-2">
                {gym.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {getAmenityIcon(amenity)}
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Badge */}
          {gym.is_verified && (
            <div className="flex justify-center">
              <Badge className="bg-green-100 text-green-800">
                ✓ Verified Gym
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onJoin(gym)}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Join This Gym
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GymDetailsModal;

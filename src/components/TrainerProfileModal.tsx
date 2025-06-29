
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, CheckCircle, MessageSquare, Calendar, Award, Users, ExternalLink, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrainerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: {
    id: string;
    name: string;
    email: string;
    location?: string;
    trainer_profile?: {
      bio: string;
      profile_image?: string;
      rate_per_hour: number;
      experience_years: number;
      specializations: string[];
      is_verified: boolean;
      certifications?: any[];
      languages?: string[];
    };
    average_rating?: number;
    total_reviews?: number;
    completed_bookings?: number;
  };
  onBook: (trainer: any) => void;
  onMessage: (trainerId: string) => void;
}

const TrainerProfileModal: React.FC<TrainerProfileModalProps> = ({
  isOpen,
  onClose,
  trainer,
  onBook,
  onMessage
}) => {
  const navigate = useNavigate();
  const profile = trainer.trainer_profile;
  
  if (!profile) return null;

  const handleViewFullProfile = () => {
    navigate(`/trainer/${trainer.id}`);
    onClose();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/trainer/${trainer.id}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 gap-0">
        <div className="relative">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-pink-700 via-pink-800 to-rose-700 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-white text-2xl">Trainer Profile</DialogTitle>
              </DialogHeader>

              <div className="flex items-start gap-6">
                <Avatar className="h-28 w-28 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={profile.profile_image} />
                  <AvatarFallback className="text-2xl bg-white/20 text-white">
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold">{trainer.name}</h2>
                    {profile.is_verified && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-white/90 mb-4">
                    {trainer.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {trainer.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {profile.experience_years} years experience
                    </div>
                    {trainer.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {trainer.average_rating.toFixed(1)} ({trainer.total_reviews} reviews)
                      </div>
                    )}
                  </div>
                  
                  <div className="text-3xl font-bold text-white mb-4">
                    ৳{profile.rate_per_hour}/hour
                  </div>

                  {/* Action buttons in header */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => onMessage(trainer.id)}
                      variant="secondary"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      onClick={() => onBook(trainer)}
                      className="bg-white text-pink-700 hover:bg-white/90 font-semibold"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button 
                      onClick={handleShare}
                      variant="secondary"
                      size="icon"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="p-8 space-y-8">
            {/* About Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">About {trainer.name}</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                <div className="text-3xl font-bold text-pink-700 mb-1">{profile.experience_years}</div>
                <div className="text-sm text-pink-800 font-medium">Years Experience</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">{trainer.total_reviews || 0}</div>
                <div className="text-sm text-blue-700 font-medium">Reviews</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{trainer.completed_bookings || 0}</div>
                <div className="text-sm text-green-700 font-medium">Sessions</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{trainer.average_rating?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm text-yellow-700 font-medium">Rating</div>
              </div>
            </div>

            {/* Two column layout for details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-6">
                {/* Specializations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map(spec => (
                      <Badge key={spec} variant="outline" className="text-sm px-3 py-1 border-pink-200 text-pink-800 bg-pink-50">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map(lang => (
                        <Badge key={lang} variant="secondary" className="text-sm px-3 py-1 bg-gray-100">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Certifications */}
                {profile.certifications && profile.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Certifications</h3>
                    <div className="space-y-3">
                      {profile.certifications.map((cert: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="font-medium text-gray-900">{cert.name}</div>
                          {cert.organization && (
                            <div className="text-sm text-gray-600 mt-1">{cert.organization}</div>
                          )}
                          {cert.year && (
                            <div className="text-sm text-gray-500 mt-1">Year: {cert.year}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleViewFullProfile}
                      variant="outline" 
                      className="w-full justify-start text-pink-700 border-pink-200 hover:bg-pink-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                    <Button 
                      onClick={() => onMessage(trainer.id)}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button 
                      onClick={() => onBook(trainer)}
                      className="w-full justify-start bg-pink-700 hover:bg-pink-800"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainerProfileModal;

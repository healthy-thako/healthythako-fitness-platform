import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainerDetails } from '@/hooks/useTrainerSearch';
import { useFallbackTrainerDetails } from '@/hooks/useFallbackTrainerDetails';
import BookingModal from '@/components/BookingModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

import Breadcrumb from '@/components/Breadcrumb';
import { Star, MapPin, CheckCircle, MessageSquare, Calendar, Award, Users, ArrowLeft, Phone, Mail, Clock, Heart, Share2, Video, Home, MapPinIcon, Zap, DollarSign, Target, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PublicTrainerProfile = () => {
  const { trainerId } = useParams<{ trainerId: string; }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);


  // Use fallback hook for immediate data loading
  const { data: trainer, isLoading, error, isUsingFallback } = useFallbackTrainerDetails(trainerId || '');

  console.log('PublicTrainerProfile - Trainer ID:', trainerId);
  console.log('PublicTrainerProfile - Trainer Data:', trainer);

  useEffect(() => {
    if (error) {
      console.error('Error loading trainer:', error);
      toast.error('Failed to load trainer profile');
    }
  }, [error]);

  const handleBookTrainer = () => {
    if (!user) {
      toast.error('Please login to book a trainer');
      return;
    }
    setShowBookingModal(true);
  };

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
        trainerId: trainer?.id,
        trainerName: trainer?.name || 'Trainer'
      }
    });
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${trainer?.name} - Personal Trainer`,
        text: `Check out ${trainer?.name}'s fitness training profile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trainer Not Found</h1>
          <p className="text-gray-600 mb-6">The trainer profile you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/find-trainers')}>
            Browse Other Trainers
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const trainerProfile = (trainer as any).trainer_profiles;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: 'Find Trainers', href: '/find-trainers' },
            { label: trainer.name, current: true }
          ]}
        />

        {/* Fallback Data Notice */}
        {isUsingFallback && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800">Demo Profile</h4>
                <p className="text-xs text-blue-600 mt-1">
                  Currently showing sample trainer profile due to connectivity issues.
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

        {/* Trainer Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {trainerProfile?.profile_image ? (
                    <img
                      src={trainerProfile.profile_image}
                      alt={trainer.name}
                      className="w-32 h-32 lg:w-48 lg:h-48 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full bg-purple-100 flex items-center justify-center border-4 border-white shadow-lg">
                      <Users className="h-16 w-16 lg:h-24 lg:w-24 text-purple-600" />
                    </div>
                  )}
                  {trainerProfile?.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{trainer.name}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {trainer.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{trainer.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-yellow-600">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        <span className="font-semibold">{trainer.average_rating || 0}</span>
                        <span className="text-gray-600 ml-1">({trainer.total_reviews} reviews)</span>
                      </div>

                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>{trainer.completed_bookings} completed sessions</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {trainerProfile?.specializations?.map((spec: string) => (
                        <Badge key={spec} variant="secondary" className="bg-purple-100 text-purple-700">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{trainerProfile?.experience_years || 0} years experience</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>৳{trainerProfile?.rate_per_hour || 0}/hour</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        <span>{(trainer as any).active_gigs || trainer.gigs?.length || 0} active services</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    <Button 
                      onClick={handleBookTrainer}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleMessage}
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleToggleFavorite}
                        className={isFavorited ? "text-red-600 border-red-600" : ""}
                      >
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainer Details Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="availability">Schedule</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About {trainer.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {trainerProfile?.bio || 'This trainer is building their profile. Contact them to learn more about their services and approach to fitness training.'}
                  </p>
                </div>

                {trainerProfile?.languages && trainerProfile.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {trainerProfile.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {trainerProfile?.certifications && trainerProfile.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Certifications</h3>
                    <div className="space-y-2">
                      {trainerProfile.certifications.map((cert: any, index: number) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Award className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <div className="font-medium">{cert.name || 'Certification'}</div>
                            {cert.issuer && <div className="text-sm text-gray-600">{cert.issuer}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                {trainer.gigs && trainer.gigs.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {trainer.gigs.map((gig: any) => (
                      <div key={gig.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{gig.title}</h3>
                          <Badge variant="secondary">{gig.category}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{gig.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-600">৳{gig.basic_price}</span>
                          <Button size="sm" onClick={handleBookTrainer}>
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No services listed yet.</p>
                    <p className="text-sm mt-1">Contact the trainer directly to discuss available services.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Client Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {trainer.reviews && trainer.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {trainer.reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{review.reviewer?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{review.reviewer?.name || 'Anonymous'}</div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(review.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-gray-700 ml-13">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No reviews yet.</p>
                    <p className="text-sm mt-1">Be the first to leave a review after booking a session!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                {trainer.availability && trainer.availability.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {trainer.availability.map((slot: any) => (
                      <div key={`${slot.date}-${slot.start_time}`} className="border rounded-lg p-4">
                        <div className="font-medium text-gray-900 mb-1">
                          {format(new Date(slot.date), 'EEEE, MMM dd')}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <Badge 
                          variant={slot.is_available ? "default" : "secondary"}
                          className={slot.is_available ? "bg-green-100 text-green-800" : ""}
                        >
                          {slot.is_available ? 'Available' : 'Booked'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No availability slots set.</p>
                    <p className="text-sm mt-1">Contact the trainer directly to schedule sessions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Video className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Gallery coming soon.</p>
                  <p className="text-sm mt-1">Trainer photos and videos will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Modal */}
      {trainer && (
        <BookingModal 
          isOpen={showBookingModal} 
          onClose={() => setShowBookingModal(false)} 
          trainer={{
            id: trainer.id,
            name: trainer.name,
            trainer_profile: {
              rate_per_hour: parseFloat(String(trainerProfile?.rate_per_hour)) || 1200,
              specializations: trainerProfile?.specializations || []
            }
          }} 
        />
      )}

      <Footer />


    </div>
  );
};

export default PublicTrainerProfile;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Star, Calendar, User, MessageSquare, Edit3, Trash2, Loader2 } from 'lucide-react';
import { useClientReviews } from '@/hooks/useClientData';
import { format } from 'date-fns';

const ClientReviews = () => {
  const { data: reviews, isLoading } = useClientReviews();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 sm:h-4 sm:w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">My Reviews</h1>
              <p className="text-xs sm:text-base text-gray-600 hidden sm:block">Reviews you've left for trainers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        {reviews && reviews.length > 0 ? (
          <div className="space-y-3 sm:space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <img 
                        src="/placeholder.svg" 
                        alt={review.reviewee?.name || 'Trainer'}
                        className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <CardTitle className="text-sm sm:text-lg truncate">{review.reviewee?.name || 'Unknown Trainer'}</CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{review.booking?.title || 'Training Session'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                        <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-6 w-6 sm:h-8 sm:w-8 p-0">
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{review.rating}/5</span>
                    </div>

                    {/* Review Text */}
                    {review.comment && (
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-base text-gray-700">{review.comment}</p>
                      </div>
                    )}

                    {/* Session Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        {review.booking && (
                          <div className="flex items-center space-x-1">
                            <span>Session: ৳{review.booking.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <Star className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Complete your first session to leave a review for your trainer.
            </p>
            <Button className="mesh-gradient-overlay text-white text-sm">
              Book Your First Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientReviews;

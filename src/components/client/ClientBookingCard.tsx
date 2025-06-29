
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Video, User, DollarSign, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useCancelBooking } from '@/hooks/client/useClientBookings';
import LeaveReviewModal from '@/components/LeaveReviewModal';
import { toast } from 'sonner';

interface ClientBookingCardProps {
  booking: any;
}

const ClientBookingCard: React.FC<ClientBookingCardProps> = ({ booking }) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const cancelBooking = useCancelBooking();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': 
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online': return <Video className="h-4 w-4" />;
      case 'home': return <MapPin className="h-4 w-4" />;
      case 'gym': return <MapPin className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const hasReview = booking.reviews && booking.reviews.length > 0;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {booking.trainer?.name?.substring(0, 2) || 'TR'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.title}</h3>
                  <p className="text-sm text-gray-600">with {booking.trainer?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {booking.scheduled_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                  </div>
                )}
                {booking.scheduled_time && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {booking.scheduled_time}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getModeIcon(booking.mode)}
                  {booking.mode}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  ৳{booking.amount}
                </div>
              </div>

              {booking.description && (
                <p className="text-sm text-gray-600 mb-4">{booking.description}</p>
              )}

              {booking.notes && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">Session Notes:</p>
                  <p className="text-sm text-blue-800">{booking.notes}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.replace('_', ' ')}
              </Badge>

              {booking.status === 'completed' && !hasReview && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate Session
                </Button>
              )}

              {booking.status === 'confirmed' && (
                <Button size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Join Session
                </Button>
              )}

              {['pending', 'confirmed'].includes(booking.status) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelBooking}
                  disabled={cancelBooking.isPending}
                >
                  {cancelBooking.isPending ? 'Cancelling...' : 'Cancel'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={booking}
      />
    </>
  );
};

export default ClientBookingCard;

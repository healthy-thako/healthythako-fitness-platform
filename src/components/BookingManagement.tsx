
import React from 'react';
import { useTrainerBookings, useUpdateBookingStatus } from '@/hooks/useBookingManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const BookingManagement = () => {
  const { data: bookings, isLoading } = useTrainerBookings();
  const updateBookingStatus = useUpdateBookingStatus();

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus.mutateAsync({ bookingId, status });
      toast.success('Booking status updated successfully');
    } catch (error: any) {
      toast.error('Failed to update booking status: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <Badge variant="outline">
          {bookings?.length || 0} Total Bookings
        </Badge>
      </div>

      <div className="grid gap-4">
        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{booking.title}</CardTitle>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium">{booking.profiles?.name || 'Unknown Client'}</p>
                  </div>
                </div>
                {booking.scheduled_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                {booking.scheduled_time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{booking.scheduled_time}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Mode</p>
                  <p className="font-medium capitalize">{booking.mode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{booking.session_duration || 60} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sessions</p>
                  <p className="font-medium">{booking.session_count || 1}</p>
                </div>
              </div>

              {booking.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm mt-1">{booking.description}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg text-green-600">
                  ৳{booking.amount}
                </span>
                <div className="space-x-2">
                  {booking.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                        disabled={updateBookingStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        disabled={updateBookingStatus.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {booking.status === 'accepted' && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                      disabled={updateBookingStatus.isPending}
                    >
                      Start Session
                    </Button>
                  )}
                  
                  {booking.status === 'in_progress' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      disabled={updateBookingStatus.isPending}
                    >
                      Mark Complete
                    </Button>
                  )}

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!bookings || bookings.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">Your client bookings will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;

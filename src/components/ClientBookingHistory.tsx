
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useClientBookings } from '@/hooks/client/useClientBookings';
import ClientBookingCard from '@/components/client/ClientBookingCard';
import { Link } from 'react-router-dom';

const ClientBookingHistory = () => {
  const { data: bookings, isLoading } = useClientBookings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>
        <p className="text-gray-600">Track all your fitness sessions and appointments</p>
      </div>

      <div className="grid gap-4">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <ClientBookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">Start by booking your first fitness session!</p>
              <Link to="/find-trainers">
                <Button className="mt-4 mesh-gradient-overlay text-white">
                  Find Trainers
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientBookingHistory;

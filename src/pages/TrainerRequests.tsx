
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Clock, MessageSquare, Check, X } from 'lucide-react';
import { useTrainerOrders } from '@/hooks/useOrders';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TrainerRequests = () => {
  const { data: orders, isLoading } = useTrainerOrders();
  const updateStatus = useUpdateOrderStatus();

  const pendingRequests = orders?.filter(order => order.status === 'pending') || [];

  const handleAccept = async (orderId: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'accepted' });
      toast.success('Booking request accepted');
    } catch (error: any) {
      toast.error('Failed to accept request: ' + error.message);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'rejected' });
      toast.success('Booking request rejected');
    } catch (error: any) {
      toast.error('Failed to reject request: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">Client Requests</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage incoming booking requests</p>
            </div>
          </div>
        </div>
        <div className="p-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Client Requests</h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3">
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-xs sm:text-sm text-gray-600">You'll see new booking requests from clients here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 sm:pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-sm">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {request.client?.name || 'Unknown Client'}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      ৳{request.amount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="font-medium text-xs sm:text-sm">{request.title || 'Training Session'}</h3>
                      {request.description && (
                        <p className="text-gray-600 mt-1 text-xs">{request.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <div>
                          <p className="font-medium">Date</p>
                          <p>{request.scheduled_date ? format(new Date(request.scheduled_date), 'MMM dd, yyyy') : 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <div>
                          <p className="font-medium">Time</p>
                          <p>{request.scheduled_time || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div>
                          <p className="font-medium">Duration</p>
                          <p>{request.session_duration || 60} min</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div>
                          <p className="font-medium">Mode</p>
                          <p className="capitalize">{request.mode}</p>
                        </div>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="font-medium text-xs text-gray-700">Client Notes:</p>
                        <p className="text-gray-600 text-xs mt-1">{request.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-xs text-gray-600">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Requested {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          disabled={updateStatus.isPending}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          disabled={updateStatus.isPending}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerRequests;

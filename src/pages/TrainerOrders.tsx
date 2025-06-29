
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrainerOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const TrainerOrders = () => {
  const { data: orders, isLoading } = useTrainerOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error('Failed to update order status: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-pink-100 text-pink-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Orders</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your client bookings and sessions</p>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-1 sm:pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm sm:text-base">{order.title}</CardTitle>
                    <p className="text-xs text-gray-600">Client: {order.client?.name}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)} variant="secondary">
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 sm:mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="font-medium text-xs sm:text-sm">৳{order.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="font-medium text-xs sm:text-sm">{order.scheduled_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Mode</p>
                    <p className="font-medium text-xs sm:text-sm">{order.mode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-medium text-xs sm:text-sm">{order.session_duration} min</p>
                  </div>
                </div>

                {order.description && (
                  <div className="mb-2 sm:mb-3">
                    <p className="text-xs text-gray-600">Description</p>
                    <p className="text-xs">{order.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(order.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {order.status === 'accepted' && (
                    <Button
                      onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                      className="bg-pink-600 hover:bg-pink-700"
                      size="sm"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Start Session
                    </Button>
                  )}
                  
                  {order.status === 'in_progress' && (
                    <Button
                      onClick={() => handleStatusUpdate(order.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Complete
                    </Button>
                  )}

                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!orders || orders.length === 0) && (
            <Card>
              <CardContent className="text-center py-6 sm:py-8">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-xs sm:text-sm text-gray-600">Your client bookings will appear here</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerOrders;

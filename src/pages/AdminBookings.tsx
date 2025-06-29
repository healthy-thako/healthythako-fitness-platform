
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdminBookings, useUpdateBookingStatus, useDeleteBooking } from '@/hooks/useAdminBookings';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, DollarSign, Clock, Edit, Trash2, User, UserCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminBookings = () => {
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const { data: bookings, isLoading, error } = useAdminBookings(filters.status === 'all' ? {} : filters);
  const updateStatus = useUpdateBookingStatus();
  const deleteBooking = useDeleteBooking();
  const { toast } = useToast();

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ bookingId, status: newStatus });
      toast({
        title: 'Success',
        description: 'Booking status updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update booking status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking.mutateAsync(bookingId);
        toast({
          title: 'Success',
          description: 'Booking deleted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete booking',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading bookings: {error.message}</p>
        <p className="text-sm text-gray-500 mt-2">Please check the console for more details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Booking Management</h2>
        <p className="text-gray-600">Monitor and manage all platform bookings</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings?.filter(b => b.status === 'pending').length || 0}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bookings?.filter(b => b.status === 'completed').length || 0}
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              ৳{bookings?.reduce((sum, b) => sum + Number(b.amount || 0), 0).toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({bookings?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings?.map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg truncate">{booking.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>Client: {booking.client?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <UserCheck className="h-3 w-3 mr-1" />
                        <span>Trainer: {booking.trainer?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>৳{Number(booking.amount).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    {booking.scheduled_date && (
                      <div className="text-sm text-gray-600 mt-1">
                        Scheduled: {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                        {booking.scheduled_time && ` at ${booking.scheduled_time}`}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusUpdate(booking.id, value)}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteBooking(booking.id)}
                    disabled={deleteBooking.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No bookings found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;

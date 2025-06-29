
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Calendar, Clock, MapPin, Video, Star, MessageSquare, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientBookings } from '@/hooks/useClientData';
import { format } from 'date-fns';
import LeaveReviewModal from '@/components/LeaveReviewModal';

const ClientSessions = () => {
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { data: bookings, isLoading } = useClientBookings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = bookings?.filter(booking => 
    filter === 'all' || booking.status === filter
  ) || [];

  const handleLeaveReview = (booking: any) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your sessions...</p>
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">My Sessions</h1>
              <p className="text-xs sm:text-base text-gray-600">Manage your training sessions and appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto space-x-1 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'accepted', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <img 
                      src="/placeholder.svg" 
                      alt={session.trainer?.name || 'Trainer'}
                      className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-lg truncate">{session.trainer?.name || 'Unknown Trainer'}</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{session.title}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Message Trainer</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      {session.status === 'completed' && !session.reviews?.length && (
                        <DropdownMenuItem onClick={() => handleLeaveReview(session)}>
                          Leave Review
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {session.scheduled_date && (
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{format(new Date(session.scheduled_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  {session.scheduled_time && (
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{session.scheduled_time} ({session.session_duration || 60} minutes)</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    {session.mode === 'online' ? (
                      <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span>{session.mode === 'online' ? 'Online Session' : 'In-Person'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Badge className={`${getStatusColor(session.status || 'pending')} text-xs`}>
                      {session.status || 'pending'}
                    </Badge>
                    <span className="font-semibold text-sm sm:text-lg">৳{session.amount}</span>
                  </div>
                  {session.status === 'accepted' && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-3">
                      <Button size="sm" className="flex-1 text-xs">
                        <Video className="h-3 w-3 mr-2" />
                        Join Session
                      </Button>
                      <Button size="sm" variant="outline" className="sm:w-auto">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {session.status === 'completed' && !session.reviews?.length && (
                    <Button 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => handleLeaveReview(session)}
                    >
                      <Star className="h-3 w-3 mr-2" />
                      Leave Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">You don't have any {filter !== 'all' ? filter : ''} sessions yet.</p>
            <Button className="mesh-gradient-overlay text-white text-sm">
              Book Your First Session
            </Button>
          </div>
        )}
      </div>

      {/* Leave Review Modal */}
      {selectedBooking && (
        <LeaveReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
        />
      )}
    </div>
  );
};

export default ClientSessions;

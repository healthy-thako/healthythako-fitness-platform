
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Star, DollarSign, BookOpen, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { useClientStats, useClientBookings } from '@/hooks/useClientData';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

const ClientOverview = () => {
  const { data: stats, isLoading: statsLoading } = useClientStats();
  const { data: recentBookings, isLoading: bookingsLoading } = useClientBookings();

  const upcomingBookings = recentBookings?.filter(
    booking => ['pending', 'confirmed', 'accepted'].includes(booking.status)
  ).slice(0, 3) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-6 py-3">
        <div className="flex items-center space-x-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-xs sm:text-sm text-gray-600">Welcome back! Here's your fitness journey summary.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6 space-y-4">
        {/* Stats Cards - Mobile: 4 small cards in 2 rows */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="p-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                  <p className="text-xs font-medium text-gray-600">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="text-xs text-gray-500">Done</span>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
                  <p className="text-xs font-medium text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">৳{(stats?.totalSpent || 0).toLocaleString()}</p>
                  <p className="text-xs font-medium text-gray-600">Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  <span className="text-xs text-gray-500">Saved</span>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{stats?.favoriteTrainers || 0}</p>
                  <p className="text-xs font-medium text-gray-600">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Mobile First */}
        <Card className="p-0">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Get started with your fitness journey</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Link to="/find-trainers">
                <Button className="w-full h-16 sm:h-20 flex-col space-y-1 mesh-gradient-overlay text-white text-xs">
                  <BookOpen className="h-4 w-4" />
                  <span>Find Trainers</span>
                </Button>
              </Link>
              
              <Link to="/client-dashboard/sessions">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex-col space-y-1 text-xs">
                  <Calendar className="h-4 w-4" />
                  <span>My Sessions</span>
                </Button>
              </Link>
              
              <Link to="/client-dashboard/messages">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex-col space-y-1 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Button>
              </Link>
              
              <Link to="/client-dashboard/favorites">
                <Button variant="outline" className="w-full h-16 sm:h-20 flex-col space-y-1 text-xs">
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="p-0">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Upcoming Sessions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your scheduled training sessions</CardDescription>
              </div>
              <Link to="/client-dashboard/sessions">
                <Button variant="outline" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 mesh-gradient-overlay rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                        {booking.trainer?.name?.substring(0, 2) || 'TR'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{booking.title}</p>
                        <p className="text-xs text-gray-600 truncate">{booking.trainer?.name}</p>
                        {booking.scheduled_date && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="truncate">
                              {format(new Date(booking.scheduled_date), 'MMM dd')} 
                              {booking.scheduled_time && ` at ${booking.scheduled_time}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} text-xs ml-2 flex-shrink-0`} variant="secondary">
                      {booking.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm mb-3">No upcoming sessions</p>
                  <Link to="/find-trainers">
                    <Button size="sm" className="mesh-gradient-overlay text-white text-xs">
                      Book a Session
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOverview;

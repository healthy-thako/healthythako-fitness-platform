
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrainerAnalytics } from '@/hooks/useTrainerAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Target, Star, TrendingUp } from 'lucide-react';

const TrainerAnalytics = () => {
  const { data: analytics, isLoading } = useTrainerAnalytics();

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
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Analytics</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Track your performance and growth</p>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card className="p-2 sm:p-3">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Total Bookings</span>
                <span className="sm:hidden">Bookings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base sm:text-xl font-bold text-gray-900">{analytics?.totalBookings || 0}</div>
              <p className="text-xs text-green-600 mt-1">
                {analytics?.completedBookings || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-3">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Active Gigs</span>
                <span className="sm:hidden">Gigs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base sm:text-xl font-bold text-gray-900">{analytics?.activeGigs || 0}</div>
              <p className="text-xs text-gray-600 mt-1">
                of {analytics?.totalGigs || 0} total
              </p>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-3">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Average Rating</span>
                <span className="sm:hidden">Rating</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base sm:text-xl font-bold text-gray-900">
                {analytics?.averageRating || 0}/5
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {analytics?.totalReviews || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-3">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Completion Rate</span>
                <span className="sm:hidden">Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-base sm:text-xl font-bold text-gray-900">
                {analytics?.totalBookings 
                  ? Math.round((analytics.completedBookings / analytics.totalBookings) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-green-600 mt-1">Sessions completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Bookings Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.monthlyBookings || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerAnalytics;

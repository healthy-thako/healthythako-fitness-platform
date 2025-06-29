
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useTransactionStats } from '@/hooks/useAdminTransactions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, UserCheck, Loader2 } from 'lucide-react';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAdminAnalytics();
  const { data: transactionStats, isLoading: statsLoading } = useTransactionStats();

  if (analyticsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
        <span className="ml-2 text-sm sm:text-base">Loading analytics...</span>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-6 sm:p-8 text-center text-red-600">
        <p className="text-sm sm:text-base">Error loading analytics: {analyticsError.message}</p>
      </div>
    );
  }

  // Mock data for charts (in real implementation, this would come from analytics API)
  const userGrowthData = [
    { month: 'Jan', users: 120, trainers: 25, clients: 95 },
    { month: 'Feb', users: 180, trainers: 35, clients: 145 },
    { month: 'Mar', users: 240, trainers: 48, clients: 192 },
    { month: 'Apr', users: 320, trainers: 65, clients: 255 },
    { month: 'May', users: 410, trainers: 82, clients: 328 },
    { month: 'Jun', users: 520, trainers: 104, clients: 416 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 15000, commission: 1500 },
    { month: 'Feb', revenue: 22000, commission: 2200 },
    { month: 'Mar', revenue: 31000, commission: 3100 },
    { month: 'Apr', revenue: 45000, commission: 4500 },
    { month: 'May', revenue: 58000, commission: 5800 },
    { month: 'Jun', revenue: 72000, commission: 7200 },
  ];

  const serviceDistribution = [
    { name: 'Personal Training', value: 45, color: '#8884d8' },
    { name: 'Yoga', value: 25, color: '#82ca9d' },
    { name: 'Nutrition', value: 15, color: '#ffc658' },
    { name: 'Group Classes', value: 10, color: '#ff7c7c' },
    { name: 'Other', value: 5, color: '#8dd1e1' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb Navigation */}
      <AdminBreadcrumb 
        items={[
          { label: 'Analytics & Reports', current: true }
        ]}
        showBackButton={false}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600">Platform insights and performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="quarter">Last 3 months</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Users</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{analytics?.total_users || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">+{analytics?.new_signups_today || 0} today</span>
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">৳{transactionStats?.total_revenue?.toLocaleString() || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Commission: ৳{transactionStats?.total_commission?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Trainers</p>
                <p className="text-2xl font-bold">{analytics?.active_trainers || 0}</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <UserCheck className="h-3 w-3 mr-1" />
                  {analytics?.pending_verifications || 0} pending
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold">{analytics?.today_bookings || 0}</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Avg response: {analytics?.avg_response_time || 0}h
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="trainers" stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey="clients" stroke="#ffc658" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue & Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
                <Bar dataKey="commission" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Average Response Time</span>
                <span className="text-lg font-bold text-green-600">{analytics?.avg_response_time || 0} hours</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Pending Payouts</span>
                <span className="text-lg font-bold text-orange-600">৳{analytics?.pending_payouts?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Commission Rate</span>
                <span className="text-lg font-bold text-purple-600">10%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Platform Growth</span>
                <span className="text-lg font-bold text-blue-600">+{analytics?.new_signups_today || 0} users today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;

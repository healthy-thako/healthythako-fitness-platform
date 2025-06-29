import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useTransactionStats } from '@/hooks/useAdminTransactions';
import { useWaitlistStats } from '@/hooks/useAdminWaitlist';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  Building2,
  MessageSquare,
  UserX,
  Clock,
  Star,
  Mail
} from 'lucide-react';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';

const AdminOverview = () => {
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAdminAnalytics();
  const { data: transactionStats, isLoading: statsLoading } = useTransactionStats();
  const { data: waitlistStats, isLoading: waitlistLoading } = useWaitlistStats();

  if (analyticsLoading || statsLoading || waitlistLoading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
        <span className="ml-2 text-sm sm:text-base">Loading dashboard...</span>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-6 sm:p-8 text-center text-red-600">
        <p className="text-sm sm:text-base">Error loading dashboard: {analyticsError.message}</p>
      </div>
    );
  }

  // Mock data for charts
  const userGrowthData = [
    { month: 'Jan', users: 120, trainers: 25, clients: 95 },
    { month: 'Feb', users: 180, trainers: 35, clients: 145 },
    { month: 'Mar', users: 240, trainers: 48, clients: 192 },
    { month: 'Apr', users: 320, trainers: 65, clients: 255 },
    { month: 'May', users: 410, trainers: 82, clients: 328 },
    { month: 'Jun', users: 520, trainers: 104, clients: 416 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, commission: 9000 },
    { month: 'Feb', revenue: 67000, commission: 13400 },
    { month: 'Mar', revenue: 78000, commission: 15600 },
    { month: 'Apr', revenue: 89000, commission: 17800 },
    { month: 'May', revenue: 95000, commission: 19000 },
    { month: 'Jun', revenue: 112000, commission: 22400 },
  ];

  const pieData = [
    { name: 'Clients', value: analytics?.total_clients || 0, color: '#8884d8' },
    { name: 'Trainers', value: analytics?.total_trainers || 0, color: '#82ca9d' },
    { name: 'Gym Owners', value: 15, color: '#ffc658' }, // Mock data
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb Navigation */}
      <AdminBreadcrumb 
        items={[
          { label: 'Dashboard Overview', current: true }
        ]}
        showBackButton={false}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-gray-600">Welcome to the HealthyThako Admin Dashboard</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{analytics?.total_users || 0}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{analytics?.new_signups_today || 0} today
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">৳{(transactionStats?.total_revenue || 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ৳{(transactionStats?.completed_amount || 0).toLocaleString()} completed
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Trainers</p>
                <p className="text-2xl font-bold">{analytics?.active_trainers || 0}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {analytics?.pending_verifications || 0} pending
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold">{analytics?.today_bookings || 0}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {analytics?.total_bookings || 0} total
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Pending Bookings</p>
              <p className="text-lg font-bold text-yellow-600">{analytics?.pending_bookings || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Completed Bookings</p>
              <p className="text-lg font-bold text-green-600">{analytics?.completed_bookings || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Commission Earned</p>
              <p className="text-lg font-bold text-blue-600">৳{(analytics?.commission_earned || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Waitlist Entries</p>
              <p className="text-lg font-bold text-purple-600">{waitlistStats?.total_entries || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Suspended Users</p>
              <p className="text-lg font-bold text-red-600">{analytics?.suspended_users || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="Total Users" />
                <Line type="monotone" dataKey="trainers" stroke="#82ca9d" strokeWidth={2} name="Trainers" />
                <Line type="monotone" dataKey="clients" stroke="#ffc658" strokeWidth={2} name="Clients" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue & Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue (৳)" />
                <Bar dataKey="commission" fill="#82ca9d" name="Commission (৳)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New trainer verification pending</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment of ৳2,500 received</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">3 new user registrations</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New support ticket received</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;

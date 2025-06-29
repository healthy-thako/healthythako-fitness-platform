
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainerGigs } from '@/hooks/useGigsCRUD';
import { useTrainerOrders } from '@/hooks/useOrders';
import { useTrainerEarnings } from '@/hooks/useTrainerEarnings';
import { 
  Target, 
  DollarSign, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Star,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TrainerOverview = () => {
  const { user } = useAuth();
  const { data: gigs } = useTrainerGigs();
  const { data: orders } = useTrainerOrders();
  const { data: earnings } = useTrainerEarnings();

  const activeGigs = gigs?.filter(g => g.status === 'active').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const thisMonthEarnings = earnings?.thisMonthEarnings || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;

  const quickStats = [
    {
      title: 'Active Gigs',
      value: activeGigs,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/trainer-dashboard/gigs'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/trainer-dashboard/requests'
    },
    {
      title: 'This Month Earnings',
      value: `৳${thisMonthEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/trainer-dashboard/earnings'
    },
    {
      title: 'Completed Orders',
      value: completedOrders,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/trainer-dashboard/orders'
    }
  ];

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.name || 'Trainer'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your training business overview</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/trainer-dashboard/gigs">
            <Plus className="h-4 w-4 mr-2" />
            Create New Gig
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={stat.link}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    View details
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/trainer-dashboard/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.title}</p>
                      <p className="text-sm text-gray-600">
                        Client: {order.client?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">৳{order.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/trainer-dashboard/gigs">
                  <Target className="h-6 w-6 mb-2" />
                  <span className="text-sm">Manage Gigs</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/trainer-dashboard/messages">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span className="text-sm">Messages</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/trainer-dashboard/schedule">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/trainer-dashboard/analytics">
                  <Star className="h-6 w-6 mb-2" />
                  <span className="text-sm">Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerOverview;

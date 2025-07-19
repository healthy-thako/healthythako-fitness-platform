
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, DollarSign, Eye, ShoppingBag } from 'lucide-react';

interface GigStatsProps {
  gigs: any[];
}

const GigStats: React.FC<GigStatsProps> = ({ gigs }) => {
  const activeGigs = gigs?.filter(g => g.status === 'active').length || 0;
  const totalViews = gigs?.reduce((sum, gig) => sum + (gig.view_count || 0), 0) || 0;
  const totalOrders = gigs?.reduce((sum, gig) => sum + (gig.order_count || 0), 0) || 0;
  const avgPrice = gigs?.length > 0 
    ? gigs.reduce((sum, gig) => sum + (gig.basic_price || 0), 0) / gigs.length 
    : 0;

  const stats = [
    {
      title: 'Active Gigs',
      value: activeGigs,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Price',
      value: `৳${Math.round(avgPrice).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GigStats;

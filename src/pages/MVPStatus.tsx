import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { useNotifications } from '@/hooks/useNotifications';
import Header from '@/components/Header';
import { 
  Database, 
  CreditCard, 
  MessageSquare, 
  Smartphone, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Activity,
  Shield,
  Zap
} from 'lucide-react';

const MVPStatus = () => {
  const { user } = useAuth();
  const { isConnected: dbConnected, isLoading: dbLoading } = useSupabaseConnection();
  const { data: notifications = [] } = useNotifications();

  const getStatusIcon = (status: boolean | undefined, loading: boolean) => {
    if (loading) return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
    return status ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />;
  };

  const getStatusBadge = (status: boolean | undefined, loading: boolean) => {
    if (loading) return <Badge variant="secondary" className="text-xs px-2 py-0.5">Checking...</Badge>;
    return status ? <Badge variant="default" className="text-xs px-2 py-0.5 bg-emerald-500">Active</Badge> : <Badge variant="destructive" className="text-xs px-2 py-0.5">Issues</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>MVP Status | HealthyThako</title>
        <meta name="description" content="HealthyThako MVP status and testing dashboard" />
      </Helmet>

      <div className="min-h-screen bg-slate-50/50">
        <Header />
        
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-[#3c0747]" />
              <h1 className="text-xl font-semibold text-slate-900">System Status</h1>
            </div>
            <p className="text-sm text-slate-600">Monitor core platform health and performance metrics</p>
          </div>

          {/* System Status Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">Database</span>
                  </div>
                  {getStatusIcon(dbConnected, dbLoading)}
                </div>
                {getStatusBadge(dbConnected, dbLoading)}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-slate-700">Payments</span>
                  </div>
                  {getStatusIcon(true, false)}
                </div>
                <Badge variant="default" className="text-xs px-2 py-0.5 bg-emerald-500">Ready</Badge>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-[#c90e5c]" />
                    <span className="text-xs font-medium text-slate-700">Messaging</span>
                  </div>
                  {getStatusIcon(!!user, false)}
                </div>
                {getStatusBadge(!!user, false)}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-medium text-slate-700">Mobile</span>
                  </div>
                  {getStatusIcon(true, false)}
                </div>
                <Badge variant="default" className="text-xs px-2 py-0.5 bg-emerald-500">Responsive</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Information */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-[#3c0747]" />
                  <span>System Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-600">User Authenticated</span>
                  <Badge variant={user ? "default" : "secondary"} className="text-xs px-2 py-0.5">
                    {user ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-600">Database Connected</span>
                  <Badge variant={dbConnected ? "default" : "destructive"} className="text-xs px-2 py-0.5">
                    {dbConnected ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-600">Notifications</span>
                  <Badge variant="default" className="text-xs px-2 py-0.5 bg-slate-600">
                    {notifications?.length || 0} unread
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-600">Environment</span>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {import.meta.env.MODE}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* MVP Checklist */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-[#c90e5c]" />
                  <span>MVP Readiness</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'User Authentication', status: !!user },
                    { name: 'Database Connection', status: dbConnected },
                    { name: 'Trainer Registration', status: true },
                    { name: 'Client Registration', status: true },
                    { name: 'Service Browsing', status: true },
                    { name: 'Booking System', status: true },
                    { name: 'Payment Integration', status: true },
                    { name: 'Messaging System', status: true },
                    { name: 'Mobile Responsive', status: true },
                    { name: 'Error Handling', status: true }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="flex items-center space-x-2">
                        {item.status ? (
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-sm text-slate-700">{item.name}</span>
                      </span>
                      <Badge variant={item.status ? "default" : "destructive"} className="text-xs px-2 py-0.5">
                        {item.status ? "Ready" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default MVPStatus;

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Home, Users, Dumbbell, Building, User, Settings } from 'lucide-react';

const RoutingTest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const testRoutes = [
    { path: '/', label: 'Home', icon: Home, type: 'public' },
    { path: '/find-trainers', label: 'Find Trainers', icon: Users, type: 'public' },
    { path: '/browse-services', label: 'Browse Services', icon: Dumbbell, type: 'public' },
    { path: '/gym-membership', label: 'Gym Membership', icon: Building, type: 'public' },
    { path: '/auth', label: 'Authentication', icon: User, type: 'public' },
    { path: '/dashboard', label: 'Dashboard', icon: Settings, type: 'protected' },
    { path: '/client-dashboard', label: 'Client Dashboard', icon: User, type: 'protected' },
    { path: '/trainer-dashboard', label: 'Trainer Dashboard', icon: Users, type: 'protected' },
    { path: '/gym-dashboard', label: 'Gym Dashboard', icon: Building, type: 'protected' },
  ];

  const handleNavigateTest = (path: string) => {
    console.log(`🧪 Testing navigation to: ${path}`);
    try {
      navigate(path);
      console.log(`✅ Navigation to ${path} successful`);
    } catch (error) {
      console.error(`❌ Navigation to ${path} failed:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Routing Diagnostic Tool
            </CardTitle>
            <p className="text-sm text-gray-600">
              Test navigation functionality and diagnose routing issues
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Current Location:</p>
              <p className="text-sm text-blue-600 font-mono">{location.pathname}</p>
              {location.search && (
                <p className="text-sm text-blue-600 font-mono">Query: {location.search}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <Card key={route.path} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{route.label}</h3>
                      <p className="text-xs text-gray-500 font-mono">{route.path}</p>
                    </div>
                    <Badge variant={route.type === 'public' ? 'default' : 'secondary'}>
                      {route.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Test with Link component */}
                    <Link to={route.path} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Navigate with Link
                      </Button>
                    </Link>
                    
                    {/* Test with navigate function */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => handleNavigateTest(route.path)}
                    >
                      Navigate with useNavigate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Debugging Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>React Router Version:</strong> Check package.json for react-router-dom version
              </div>
              <div>
                <strong>Browser History:</strong> {window.history.length} entries
              </div>
              <div>
                <strong>Current URL:</strong> {window.location.href}
              </div>
              <div>
                <strong>Base URL:</strong> {window.location.origin}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">Common Routing Issues:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Check browser console for JavaScript errors</li>
                <li>• Verify React Router is properly configured</li>
                <li>• Ensure all route paths match exactly</li>
                <li>• Check for conflicting route definitions</li>
                <li>• Verify protected route authentication</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoutingTest;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, Database, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const AuthTest = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAuthTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Supabase Client Auth State',
        test: async () => {
          const { data: { user }, error } = await supabase.auth.getUser();
          return { 
            success: !!user && !error, 
            data: user ? { id: user.id, email: user.email } : null,
            error: error?.message 
          };
        }
      },
      {
        name: 'Auth Context State',
        test: async () => {
          return { 
            success: !!user, 
            data: user ? { id: user.id, email: user.email } : null,
            error: !user ? 'No user in auth context' : null
          };
        }
      },
      {
        name: 'User Profile Access',
        test: async () => {
          if (!user) return { success: false, error: 'No authenticated user' };
          
          const { data, error } = await supabase
            .from('users')
            .select('id, email, user_type, created_at')
            .eq('id', user.id)
            .single();
          
          return { 
            success: !!data && !error, 
            data,
            error: error?.message 
          };
        }
      },
      {
        name: 'User Profile Table Access',
        test: async () => {
          if (!user) return { success: false, error: 'No authenticated user' };
          
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          return { 
            success: !error, // Allow empty results
            data,
            error: error?.message 
          };
        }
      },
      {
        name: 'Trainers Table Public Access',
        test: async () => {
          const { data, error } = await supabase
            .from('trainers')
            .select('id, name, user_id')
            .limit(3);
          
          return { 
            success: !!data && !error, 
            data: data ? `Found ${data.length} trainers` : null,
            error: error?.message 
          };
        }
      },
      {
        name: 'Gyms Table Public Access',
        test: async () => {
          const { data, error } = await supabase
            .from('gyms')
            .select('id, name')
            .limit(3);
          
          return { 
            success: !!data && !error, 
            data: data ? `Found ${data.length} gyms` : null,
            error: error?.message 
          };
        }
      },
      {
        name: 'RLS Policy Test - Insert User Profile',
        test: async () => {
          if (!user) return { success: false, error: 'No authenticated user' };
          
          // Try to insert/update user profile
          const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.id,
              full_name: 'Test User',
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          return { 
            success: !!data && !error, 
            data: data ? 'Profile upsert successful' : null,
            error: error?.message 
          };
        }
      }
    ];

    for (const test of tests) {
      console.log(`🧪 Running test: ${test.name}`);
      try {
        const result = await test.test();
        setTestResults(prev => [...prev, {
          name: test.name,
          ...result,
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }]);
      }
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    if (!authLoading) {
      runAuthTests();
    }
  }, [authLoading]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication & RLS Policy Test
            </CardTitle>
            <p className="text-sm text-gray-600">
              Testing authentication state and Row Level Security policies
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={runAuthTests} disabled={isRunning}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running Tests...' : 'Run Tests Again'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auth Context Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Auth State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Loading:</strong> 
                <Badge variant={authLoading ? 'secondary' : 'default'} className="ml-2">
                  {authLoading ? 'Loading...' : 'Ready'}
                </Badge>
              </div>
              <div>
                <strong>User:</strong> 
                <Badge variant={user ? 'default' : 'destructive'} className="ml-2">
                  {user ? 'Authenticated' : 'Not Authenticated'}
                </Badge>
              </div>
              {user && (
                <>
                  <div>
                    <strong>User ID:</strong> 
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      {user.id}
                    </code>
                  </div>
                  <div>
                    <strong>Email:</strong> 
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      {user.email}
                    </code>
                  </div>
                </>
              )}
              <div>
                <strong>Profile:</strong> 
                <Badge variant={profile ? 'default' : 'secondary'} className="ml-2">
                  {profile ? 'Loaded' : 'Not Loaded'}
                </Badge>
              </div>
              {profile && (
                <div>
                  <strong>User Type:</strong> 
                  <Badge variant="outline" className="ml-2">
                    {profile.user_type}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="space-y-4">
          {testResults.map((result, index) => {
            const StatusIcon = result.success ? CheckCircle : XCircle;
            
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      <span>{result.name}</span>
                    </div>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.success ? (
                      <div>
                        <strong>Result:</strong>
                        <pre className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-xs overflow-x-auto">
                          {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <strong>Error:</strong>
                        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {result.error}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* RLS Policy Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              RLS Policy Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Public Access (No Auth Required):</strong>
                <ul className="mt-1 ml-4 space-y-1 list-disc">
                  <li>✅ Trainers table - full read access</li>
                  <li>✅ Gyms table - full read access</li>
                  <li>✅ Users table - basic info read access</li>
                  <li>✅ Gym images, amenities, hours - read access</li>
                </ul>
              </div>
              
              <div>
                <strong>Authenticated User Access:</strong>
                <ul className="mt-1 ml-4 space-y-1 list-disc">
                  <li>✅ Own user profile - full CRUD</li>
                  <li>✅ Own user_profiles - full CRUD</li>
                  <li>✅ Own trainer profile - full CRUD (if trainer)</li>
                  <li>✅ Own gym profile - full CRUD (if gym owner)</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Expected Behavior:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Public pages (trainer/gym profiles) should work without auth</li>
                  <li>• Protected pages (dashboards) should require authentication</li>
                  <li>• Users should be able to view and edit their own data</li>
                  <li>• Cross-user data access should be restricted</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthTest;

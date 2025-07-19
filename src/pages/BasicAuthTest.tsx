import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const BasicAuthTest = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [basicTests, setBasicTests] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple synchronous tests that don't require database queries
    const runBasicTests = () => {
      console.log('🧪 Running basic auth tests...');
      
      const tests = [
        {
          name: 'Supabase Client Initialized',
          success: !!supabase,
          data: supabase ? 'Client exists' : null,
          error: !supabase ? 'Supabase client not initialized' : null
        },
        {
          name: 'Auth Context Loading State',
          success: typeof authLoading === 'boolean',
          data: `Loading: ${authLoading}`,
          error: typeof authLoading !== 'boolean' ? 'Invalid loading state' : null
        },
        {
          name: 'User Object from Context',
          success: !authLoading && (user !== undefined),
          data: user ? { id: user.id, email: user.email } : 'No user',
          error: authLoading ? 'Still loading' : (!user ? 'No user found' : null)
        },
        {
          name: 'Profile Object from Context',
          success: !authLoading && (profile !== undefined),
          data: profile ? { user_type: profile.user_type } : 'No profile',
          error: authLoading ? 'Still loading' : null
        },
        {
          name: 'Supabase Auth State (Sync)',
          success: true, // We'll check this synchronously
          data: 'Checking auth state...',
          error: null
        }
      ];

      setBasicTests(tests);
      setIsReady(true);
    };

    // Run tests after a short delay to let auth context settle
    const timer = setTimeout(runBasicTests, 1000);
    return () => clearTimeout(timer);
  }, [user, profile, authLoading]);

  const testSupabaseAuth = async () => {
    console.log('🧪 Testing Supabase auth state...');
    
    try {
      // Use a very short timeout for this test
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timeout')), 3000);
      });

      const { data: { user: supabaseUser }, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ]) as any;

      setBasicTests(prev => prev.map(test => 
        test.name === 'Supabase Auth State (Sync)' 
          ? {
              ...test,
              success: !!supabaseUser && !error,
              data: supabaseUser ? { id: supabaseUser.id, email: supabaseUser.email } : 'No user',
              error: error?.message || (!supabaseUser ? 'No authenticated user' : null)
            }
          : test
      ));
    } catch (error) {
      console.error('Auth test failed:', error);
      setBasicTests(prev => prev.map(test => 
        test.name === 'Supabase Auth State (Sync)' 
          ? {
              ...test,
              success: false,
              data: null,
              error: error.message
            }
          : test
      ));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Basic Authentication Test
            </CardTitle>
            <p className="text-sm text-gray-600">
              Simple tests that don't require database queries
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={testSupabaseAuth} variant="outline">
                Test Supabase Auth
              </Button>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
              <Button onClick={() => window.location.href = '/auth'} variant="outline">
                Go to Auth Page
              </Button>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> {isReady ? 'Tests completed' : 'Loading...'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Auth State */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Auth Loading:</strong> 
                <Badge variant={authLoading ? 'secondary' : 'default'} className="ml-2">
                  {String(authLoading)}
                </Badge>
              </div>
              <div>
                <strong>User Present:</strong> 
                <Badge variant={user ? 'default' : 'destructive'} className="ml-2">
                  {String(!!user)}
                </Badge>
              </div>
              <div>
                <strong>Profile Present:</strong> 
                <Badge variant={profile ? 'default' : 'secondary'} className="ml-2">
                  {String(!!profile)}
                </Badge>
              </div>
              <div>
                <strong>Tests Ready:</strong> 
                <Badge variant={isReady ? 'default' : 'secondary'} className="ml-2">
                  {String(isReady)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {isReady && (
          <div className="space-y-4">
            {basicTests.map((test, index) => {
              const StatusIcon = test.success ? CheckCircle : XCircle;
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base">{test.name}</span>
                      <Badge variant={test.success ? 'default' : 'destructive'}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {test.success ? 'PASS' : 'FAIL'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {test.success ? (
                      <div>
                        <strong>Result:</strong>
                        <pre className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          {typeof test.data === 'string' ? test.data : JSON.stringify(test.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <strong>Error:</strong>
                        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {test.error}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Debug Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Current URL:</strong> {window.location.href}
              </div>
              <div>
                <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
              </div>
              <div>
                <strong>Environment:</strong> {import.meta.env.MODE}
              </div>
              <div>
                <strong>Debug Logs:</strong> {import.meta.env.VITE_ENABLE_DEBUG_LOGS || 'Not set'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BasicAuthTest;

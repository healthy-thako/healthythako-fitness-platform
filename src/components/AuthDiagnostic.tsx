import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthDiagnostic = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async (testName: string, testFn: () => Promise<any>) => {
    try {
      const result = await testFn();
      setDiagnostics(prev => ({
        ...prev,
        [testName]: { success: true, result, error: null }
      }));
      return result;
    } catch (error: any) {
      setDiagnostics(prev => ({
        ...prev,
        [testName]: { success: false, result: null, error: error.message }
      }));
      throw error;
    }
  };

  const testSupabaseConnection = async () => {
    return runDiagnostic('Supabase Connection', async () => {
      const { data, error } = await supabase.from('trainers').select('count').limit(1);
      if (error) throw error;
      return 'Connected successfully';
    });
  };

  const testAnonymousAccess = async () => {
    return runDiagnostic('Anonymous Access', async () => {
      // Test without authentication
      const { data, error } = await supabase.from('trainers').select('id, name').limit(3);
      if (error) throw error;
      return `Found ${data.length} trainers`;
    });
  };

  const testTrainerSearch = async () => {
    return runDiagnostic('Trainer Search Function', async () => {
      const { data, error } = await supabase.rpc('search_trainers', {
        search_query: '',
        location_filter: null,
        specialty_filter: null,
        experience_filter: null,
        rating_filter: null,
        price_min: null,
        price_max: null
      });
      if (error) throw error;
      return `Search returned ${data.length} results`;
    });
  };

  const testSpecialties = async () => {
    return runDiagnostic('Specialties Access', async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('specialties')
        .not('specialties', 'is', null)
        .limit(5);
      if (error) throw error;
      return `Found ${data.length} trainers with specialties`;
    });
  };

  const testAuthenticatedAccess = async () => {
    return runDiagnostic('Authenticated Access', async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      const { data, error } = await supabase.from('users').select('id').eq('id', user.id);
      if (error) throw error;
      return 'Authenticated access working';
    });
  };

  const testEnvironmentVariables = async () => {
    return runDiagnostic('Environment Variables', async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL not found');
      if (!anonKey) throw new Error('VITE_SUPABASE_ANON_KEY not found');
      
      return {
        url: supabaseUrl,
        keyLength: anonKey.length,
        keyPrefix: anonKey.substring(0, 20) + '...'
      };
    });
  };

  const runAllDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics({});
    
    try {
      await testEnvironmentVariables();
      await testSupabaseConnection();
      await testAnonymousAccess();
      await testSpecialties();
      await testTrainerSearch();
      
      if (user) {
        await testAuthenticatedAccess();
      }
      
      toast.success('All diagnostics completed');
    } catch (error) {
      toast.error('Some diagnostics failed');
    } finally {
      setIsRunning(false);
    }
  };

  const fixAnonymousAccess = async () => {
    try {
      // Try to create a more permissive policy for anonymous access
      const { error } = await supabase.rpc('create_anon_policy');
      if (error) throw error;
      toast.success('Anonymous access policy updated');
    } catch (error: any) {
      toast.error('Failed to update policy: ' + error.message);
    }
  };

  useEffect(() => {
    // Auto-run diagnostics on component mount
    runAllDiagnostics();
  }, []);

  const DiagnosticResult = ({ testName, result }: { testName: string; result: any }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {result?.success ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : result?.error ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-gray-400" />
        )}
        <span className="font-medium">{testName}</span>
      </div>
      
      {result?.success && (
        <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
          <p>✅ {typeof result.result === 'string' ? result.result : JSON.stringify(result.result)}</p>
        </div>
      )}
      
      {result?.error && (
        <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
          <p>❌ {result.error}</p>
        </div>
      )}
      
      {!result && (
        <div className="text-sm text-gray-500">
          Test not run yet
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Authentication Diagnostic Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={runAllDiagnostics} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Diagnostics...
                  </>
                ) : (
                  'Run All Diagnostics'
                )}
              </Button>
              
              <Button 
                onClick={testAnonymousAccess} 
                disabled={isRunning}
                variant="outline"
              >
                Test Anonymous Access
              </Button>
              
              <Button 
                onClick={testTrainerSearch} 
                disabled={isRunning}
                variant="outline"
              >
                Test Search Function
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DiagnosticResult testName="Environment Variables" result={diagnostics['Environment Variables']} />
              <DiagnosticResult testName="Supabase Connection" result={diagnostics['Supabase Connection']} />
              <DiagnosticResult testName="Anonymous Access" result={diagnostics['Anonymous Access']} />
              <DiagnosticResult testName="Specialties Access" result={diagnostics['Specialties Access']} />
              <DiagnosticResult testName="Trainer Search Function" result={diagnostics['Trainer Search Function']} />
              {user && <DiagnosticResult testName="Authenticated Access" result={diagnostics['Authenticated Access']} />}
            </div>

            {Object.keys(diagnostics).length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Diagnostic Summary:</h3>
                <div className="text-sm space-y-1">
                  <p>Total Tests: {Object.keys(diagnostics).length}</p>
                  <p>Passed: {Object.values(diagnostics).filter((r: any) => r.success).length}</p>
                  <p>Failed: {Object.values(diagnostics).filter((r: any) => !r.success).length}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {user ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>User Authentication: {user ? 'Authenticated' : 'Not Authenticated'}</span>
            </div>
            
            {user && (
              <div className="bg-green-50 p-3 rounded-lg text-sm">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role || 'authenticated'}</p>
              </div>
            )}
            
            {!user && (
              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                <p><strong>Note:</strong> Some features require authentication. The trainer search should work without authentication due to public RLS policies.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Fixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              If you're experiencing 401 errors, try these solutions:
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                Reload Page (Clear Cache)
              </Button>
              
              <Button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }} 
                variant="outline" 
                size="sm"
              >
                Clear Storage & Reload
              </Button>
              
              <Button 
                onClick={() => window.open('/auth/login', '_blank')} 
                variant="outline" 
                size="sm"
              >
                Try Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDiagnostic;

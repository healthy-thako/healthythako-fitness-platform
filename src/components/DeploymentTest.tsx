import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Globe, Database, Key } from 'lucide-react';

const DeploymentTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Collect environment variables
    const vars = {
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
      'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      'VITE_APP_ENVIRONMENT': import.meta.env.VITE_APP_ENVIRONMENT || 'NOT SET',
      'VITE_APP_URL': import.meta.env.VITE_APP_URL || 'NOT SET',
      'NODE_ENV': import.meta.env.NODE_ENV || 'NOT SET',
      'MODE': import.meta.env.MODE || 'NOT SET',
    };
    setEnvVars(vars);
  }, []);

  const runDeploymentTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Environment Variables',
        icon: <Key className="w-4 h-4" />,
        test: async () => {
          const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
          const missing = required.filter(key => !import.meta.env[key]);
          
          return {
            success: missing.length === 0,
            data: missing.length === 0 ? 'All required env vars present' : `Missing: ${missing.join(', ')}`,
            error: missing.length > 0 ? `Missing environment variables: ${missing.join(', ')}` : null
          };
        }
      },
      {
        name: 'Supabase Connection',
        icon: <Database className="w-4 h-4" />,
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('count')
              .limit(1);
            
            return {
              success: !error,
              data: !error ? 'Connected successfully' : null,
              error: error?.message
            };
          } catch (err) {
            return {
              success: false,
              data: null,
              error: err instanceof Error ? err.message : 'Unknown error'
            };
          }
        }
      },
      {
        name: 'Network Connectivity',
        icon: <Globe className="w-4 h-4" />,
        test: async () => {
          try {
            const response = await fetch('https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/', {
              method: 'GET',
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
              }
            });
            
            return {
              success: response.ok,
              data: response.ok ? `Status: ${response.status}` : null,
              error: !response.ok ? `HTTP ${response.status}: ${response.statusText}` : null
            };
          } catch (err) {
            return {
              success: false,
              data: null,
              error: err instanceof Error ? err.message : 'Network error'
            };
          }
        }
      },
      {
        name: 'Data Fetching - Users',
        icon: <Database className="w-4 h-4" />,
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('id, email, user_type')
              .limit(5);
            
            return {
              success: !error && data,
              data: data ? `Fetched ${data.length} users` : null,
              error: error?.message
            };
          } catch (err) {
            return {
              success: false,
              data: null,
              error: err instanceof Error ? err.message : 'Unknown error'
            };
          }
        }
      },
      {
        name: 'Data Fetching - Trainers',
        icon: <Database className="w-4 h-4" />,
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('trainers')
              .select('id, name, user_id')
              .limit(5);
            
            return {
              success: !error && data,
              data: data ? `Fetched ${data.length} trainers` : null,
              error: error?.message
            };
          } catch (err) {
            return {
              success: false,
              data: null,
              error: err instanceof Error ? err.message : 'Unknown error'
            };
          }
        }
      },
      {
        name: 'Data Fetching - Gyms',
        icon: <Database className="w-4 h-4" />,
        test: async () => {
          try {
            const { data, error } = await supabase
              .from('gyms')
              .select('id, name, address')
              .limit(5);
            
            return {
              success: !error && data,
              data: data ? `Fetched ${data.length} gyms` : null,
              error: error?.message
            };
          } catch (err) {
            return {
              success: false,
              data: null,
              error: err instanceof Error ? err.message : 'Unknown error'
            };
          }
        }
      },
      {
        name: 'Authentication Test',
        icon: <Key className="w-4 h-4" />,
        test: async () => {
          try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            return {
              success: !error,
              data: user ? `User: ${user.email}` : 'No authenticated user',
              error: error?.message
            };
          } catch (err) {
            return {
              success: false,
              data: null,
              error: err instanceof Error ? err.message : 'Auth error'
            };
          }
        }
      }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          icon: test.icon,
          ...result
        });
      } catch (error) {
        results.push({
          name: test.name,
          icon: test.icon,
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'Test failed'
        });
      }
    }
    
    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Deployment Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Variables */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Environment Variables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <Badge variant={value !== 'NOT SET' ? "default" : "destructive"}>
                    {value === 'NOT SET' ? 'NOT SET' : value.length > 20 ? 'SET' : value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Test Button */}
          <Button 
            onClick={runDeploymentTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run Deployment Tests'}
          </Button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.icon}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {result.data && (
                        <span className="text-sm text-gray-600">{result.data}</span>
                      )}
                      {result.error && (
                        <span className="text-sm text-red-600">{result.error}</span>
                      )}
                      {getStatusBadge(result.success)}
                      {getStatusIcon(result.success)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {testResults.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="flex gap-4">
                <span className="text-green-600">
                  ✅ Passed: {testResults.filter(r => r.success).length}
                </span>
                <span className="text-red-600">
                  ❌ Failed: {testResults.filter(r => !r.success).length}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentTest;

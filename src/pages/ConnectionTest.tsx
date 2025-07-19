import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testSupabaseConnection, logTestResults, ConnectionTestResult } from '@/utils/testSupabaseConnection';
import { useTrainerSearch } from '@/hooks/useTrainerSearch';
import { useGyms } from '@/hooks/useGyms';
import { Loader2, CheckCircle, XCircle, Clock, Database, Zap } from 'lucide-react';
import FallbackTestComponent from '@/components/FallbackTestComponent';

const ConnectionTest = () => {
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Test the actual hooks used in the app
  const { data: trainers, isLoading: trainersLoading, error: trainersError } = useTrainerSearch({
    limit: 3
  });
  
  const { data: gyms, isLoading: gymsLoading, error: gymsError } = useGyms();

  const runConnectionTest = async () => {
    setIsRunningTest(true);
    try {
      console.log('🚀 Starting comprehensive connection test...');
      const results = await testSupabaseConnection();
      setTestResults(results);
      logTestResults(results);
    } catch (error) {
      console.error('❌ Connection test failed:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Database className="inline-block mr-3 h-8 w-8" />
            Supabase Connection Test
          </h1>
          <p className="text-gray-600">
            Test database connections, RPC functions, and query performance
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Connection Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runConnectionTest}
              disabled={isRunningTest}
              className="mb-4"
            >
              {isRunningTest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Connection Test'
              )}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.success)}
                      <div>
                        <div className="font-medium">{result.test}</div>
                        {result.error && (
                          <div className="text-sm text-red-600">{result.error}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {result.duration}ms
                      </div>
                      {getStatusBadge(result.success)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Hook Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trainer Search Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Trainer Search Hook
                {trainersLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : trainersError ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainersLoading && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Loading trainers...</p>
                </div>
              )}
              
              {trainersError && (
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{trainersError.message}</p>
                </div>
              )}
              
              {trainers && (
                <div>
                  <p className="text-green-600 font-medium mb-2">
                    ✅ Successfully loaded {trainers.length} trainers
                  </p>
                  <div className="space-y-2">
                    {trainers.slice(0, 2).map((trainer) => (
                      <div key={trainer.id} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{trainer.name}</div>
                        <div className="text-sm text-gray-600">{trainer.location}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gym Search Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Gym Search Hook
                {gymsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : gymsError ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gymsLoading && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Loading gyms...</p>
                </div>
              )}
              
              {gymsError && (
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{gymsError.message}</p>
                </div>
              )}
              
              {gyms && (
                <div>
                  <p className="text-green-600 font-medium mb-2">
                    ✅ Successfully loaded {gyms.length} gyms
                  </p>
                  <div className="space-y-2">
                    {gyms.slice(0, 2).map((gym) => (
                      <div key={gym.id} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{gym.name}</div>
                        <div className="text-sm text-gray-600">{gym.address}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">Environment</div>
                <div className="text-gray-600">Development</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Supabase URL</div>
                <div className="text-gray-600 truncate">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Debug Logs</div>
                <div className="text-gray-600">
                  {import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true' ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Open browser console to see detailed debug logs from the enhanced timeout utilities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Fallback Test Component */}
        <div className="mt-8">
          <FallbackTestComponent />
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;

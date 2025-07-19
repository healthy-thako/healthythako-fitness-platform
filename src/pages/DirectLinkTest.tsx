import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, queryWithTimeout } from '@/integrations/supabase/client';
import { ArrowLeft, Database, User, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DirectLinkTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Test the specific IDs you mentioned
  const testIds = [
    {
      type: 'trainer',
      id: 'f207124d-7500-47af-a642-24e407f0fd73',
      url: '/trainer/f207124d-7500-47af-a642-24e407f0fd73'
    },
    {
      type: 'trainer',
      id: 'fd414422-9437-4edf-9a55-04099d8fe020',
      url: '/trainer/fd414422-9437-4edf-9a55-04099d8fe020'
    },
    {
      type: 'gym',
      id: '60bb9206-91db-4617-a8c2-a001b879498c',
      url: '/gym/60bb9206-91db-4617-a8c2-a001b879498c'
    }
  ];

  const testDatabaseConnection = async (type: string, id: string) => {
    console.log(`🧪 Testing ${type} ID: ${id}`);

    try {
      if (type === 'trainer') {
        // Test trainer lookup with enhanced timeout utility
        console.log('Testing trainer by ID with enhanced timeout...');

        const { data: trainerRecord, error: trainerError } = await queryWithTimeout(
          supabase
            .from('trainers')
            .select('id, user_id, name, status')
            .eq('id', id)
            .single(),
          5000, // 5 second timeout
          1 // 1 retry
        );

        if (trainerRecord) {
          console.log('✅ Trainer found by ID:', trainerRecord);
          return { success: true, data: trainerRecord, method: 'trainer_id' };
        }

        console.log('Trainer not found by ID, trying user_id with enhanced timeout...');

        const { data: trainerByUserId, error: userIdError } = await queryWithTimeout(
          supabase
            .from('trainers')
            .select('id, user_id, name, status')
            .eq('user_id', id)
            .single(),
          5000, // 5 second timeout
          1 // 1 retry
        );

        if (trainerByUserId) {
          console.log('✅ Trainer found by user_id:', trainerByUserId);
          return { success: true, data: trainerByUserId, method: 'user_id' };
        }

        console.log('❌ Trainer not found by either method');
        return { 
          success: false, 
          error: `Trainer not found. ID error: ${trainerError?.message}, User ID error: ${userIdError?.message}` 
        };

      } else {
        // Test gym lookup with enhanced timeout
        console.log('Testing gym by ID with enhanced timeout...');

        const { data: gym, error } = await queryWithTimeout(
          supabase
            .from('gyms')
            .select('id, name, status')
            .eq('id', id)
            .single(),
          5000, // 5 second timeout
          1 // 1 retry
        );

        if (gym) {
          console.log('✅ Gym found:', gym);
          return { success: true, data: gym, method: 'gym_id' };
        }

        console.log('❌ Gym not found:', error);
        return { success: false, error: error?.message || 'Gym not found' };
      }
    } catch (error) {
      console.error(`❌ Database test failed for ${type}:`, error);
      return { success: false, error: error.message };
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    for (const testCase of testIds) {
      console.log(`\n🔍 Testing ${testCase.type}: ${testCase.id}`);
      
      const result = await testDatabaseConnection(testCase.type, testCase.id);
      
      setTestResults(prev => [...prev, {
        ...testCase,
        ...result,
        timestamp: new Date().toISOString()
      }]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Direct Link Database Test
            </CardTitle>
            <p className="text-sm text-gray-600">
              Testing the specific trainer and gym IDs that are causing navigation issues
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={runAllTests} disabled={isLoading}>
                {isLoading ? 'Testing...' : 'Run Tests Again'}
              </Button>
              <Link to="/linking-test">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Linking Test
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="space-y-4">
          {testResults.map((result, index) => {
            const Icon = result.type === 'trainer' ? User : Building;
            const StatusIcon = result.success ? CheckCircle : XCircle;
            
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="capitalize">{result.type} Test</span>
                    </div>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <strong>ID:</strong> 
                      <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                        {result.id}
                      </code>
                    </div>
                    
                    <div>
                      <strong>URL:</strong> 
                      <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                        {result.url}
                      </code>
                    </div>

                    {result.success ? (
                      <div className="space-y-2">
                        <div>
                          <strong>Found via:</strong> 
                          <Badge variant="outline" className="ml-2">
                            {result.method}
                          </Badge>
                        </div>
                        <div>
                          <strong>Data:</strong>
                          <pre className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                        <div className="flex gap-2">
                          <Link to={result.url}>
                            <Button size="sm" variant="outline">
                              Test Navigation
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <strong>Error:</strong>
                        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {result.error}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Debug Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>ProfileProtectedRoute Logic:</strong>
                <ol className="mt-1 ml-4 space-y-1 list-decimal">
                  <li>Check if ID starts with 'fallback-' → Allow immediately</li>
                  <li>For trainers: Try finding by trainer.id first</li>
                  <li>If not found: Try finding by trainer.user_id</li>
                  <li>For gyms: Try finding by gym.id</li>
                  <li>If found: Allow access, else redirect to listing page</li>
                </ol>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">Expected Behavior:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• If database lookup succeeds → Page should load</li>
                  <li>• If database lookup fails → Redirect to listing page</li>
                  <li>• If there's a network error → Show loading spinner</li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">Possible Issues:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Database connection timeout during validation</li>
                  <li>• RLS policies blocking the lookup queries</li>
                  <li>• ID format mismatch (UUID vs string)</li>
                  <li>• ProfileProtectedRoute component error</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectLinkTest;

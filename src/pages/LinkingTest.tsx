import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrainerSearch } from '@/hooks/useTrainerSearch';
import { useGyms } from '@/hooks/useGyms';
import { ArrowRight, User, Building, ExternalLink, Eye, AlertCircle } from 'lucide-react';

const LinkingTest = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<any[]>([]);

  // Get real trainer and gym data
  const { data: trainers, isLoading: trainersLoading } = useTrainerSearch({ limit: 3 });
  const { data: gyms, isLoading: gymsLoading } = useGyms();

  const testTrainerLink = async (trainer: any) => {
    console.log('🧪 Testing trainer link:', trainer);
    console.log('Trainer ID:', trainer.id);
    console.log('Trainer data:', trainer);
    
    try {
      navigate(`/trainer/${trainer.id}`);
      setTestResults(prev => [...prev, {
        type: 'trainer',
        id: trainer.id,
        name: trainer.name,
        status: 'success',
        message: 'Navigation attempted'
      }]);
    } catch (error) {
      console.error('Trainer navigation error:', error);
      setTestResults(prev => [...prev, {
        type: 'trainer',
        id: trainer.id,
        name: trainer.name,
        status: 'error',
        message: error.message
      }]);
    }
  };

  const testGymLink = async (gym: any) => {
    console.log('🧪 Testing gym link:', gym);
    console.log('Gym ID:', gym.id);
    console.log('Gym data:', gym);
    
    try {
      navigate(`/gym/${gym.id}`);
      setTestResults(prev => [...prev, {
        type: 'gym',
        id: gym.id,
        name: gym.name,
        status: 'success',
        message: 'Navigation attempted'
      }]);
    } catch (error) {
      console.error('Gym navigation error:', error);
      setTestResults(prev => [...prev, {
        type: 'gym',
        id: gym.id,
        name: gym.name,
        status: 'error',
        message: error.message
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Trainer & Gym Linking Test
            </CardTitle>
            <p className="text-sm text-gray-600">
              Test navigation from trainer/gym cards to their detail pages
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trainer Links Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Trainer Links Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainersLoading ? (
                <p className="text-gray-500">Loading trainers...</p>
              ) : trainers && trainers.length > 0 ? (
                <div className="space-y-3">
                  {trainers.slice(0, 3).map((trainer) => (
                    <div key={trainer.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{trainer.name}</h4>
                          <p className="text-xs text-gray-500 font-mono">ID: {trainer.id}</p>
                        </div>
                        <Badge variant="outline">
                          {trainer.id?.startsWith('fallback-') ? 'Fallback' : 'Real'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/trainer/${trainer.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Link
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => testTrainerLink(trainer)}
                          className="w-full"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No trainers found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gym Links Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Gym Links Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gymsLoading ? (
                <p className="text-gray-500">Loading gyms...</p>
              ) : gyms && gyms.length > 0 ? (
                <div className="space-y-3">
                  {gyms.slice(0, 3).map((gym) => (
                    <div key={gym.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{gym.name}</h4>
                          <p className="text-xs text-gray-500 font-mono">ID: {gym.id}</p>
                        </div>
                        <Badge variant="outline">
                          {gym.id?.startsWith('fallback-') ? 'Fallback' : 'Real'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/gym/${gym.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Link
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => testGymLink(gym)}
                          className="w-full"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No gyms found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{result.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({result.type})</span>
                    </div>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>Expected Route Patterns:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Trainer: <code>/trainer/:trainerId</code></li>
                  <li>• Gym: <code>/gym/:gymId</code></li>
                </ul>
              </div>
              <div>
                <strong>ProfileProtectedRoute Validation:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Checks if trainer/gym exists in database</li>
                  <li>• Allows fallback IDs (starting with 'fallback-')</li>
                  <li>• Redirects to listing page if not found</li>
                </ul>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">Common Issues:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• ID mismatch between card data and database</li>
                  <li>• ProfileProtectedRoute validation failing</li>
                  <li>• Fallback data using invalid IDs</li>
                  <li>• Database connection issues during validation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinkingTest;

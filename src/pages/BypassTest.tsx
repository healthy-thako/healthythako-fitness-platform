import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import PublicTrainerProfile from '@/pages/PublicTrainerProfile';
import PublicGymProfile from '@/pages/PublicGymProfile';

const BypassTest = () => {
  const { type, id } = useParams<{ type: string; id: string }>();

  if (!type || !id) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Invalid Test URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use the format: <code>/bypass-test/trainer/[id]</code> or <code>/bypass-test/gym/[id]</code>
              </p>
              <Link to="/direct-link-test">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Direct Link Test
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Header */}
      <div className="bg-yellow-100 border-b border-yellow-200 p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                BYPASS MODE: ProfileProtectedRoute Disabled
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {type === 'trainer' ? <User className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                <span className="font-medium capitalize">{type}</span>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {id}
              </Badge>
              <Link to="/direct-link-test">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Render the actual component without ProfileProtectedRoute */}
      <div className="relative">
        {type === 'trainer' ? (
          <div>
            <div className="bg-green-100 border-b border-green-200 p-2">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span>Loading PublicTrainerProfile component directly (no route protection)</span>
                </div>
              </div>
            </div>
            <PublicTrainerProfile />
          </div>
        ) : (
          <div>
            <div className="bg-green-100 border-b border-green-200 p-2">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span>Loading PublicGymProfile component directly (no route protection)</span>
                </div>
              </div>
            </div>
            <PublicGymProfile />
          </div>
        )}
      </div>
    </div>
  );
};

export default BypassTest;

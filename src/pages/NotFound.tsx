
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | HealthyThako</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link to="/trainers">
              <Button variant="outline" className="w-full">
                Find Trainers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NotFound;

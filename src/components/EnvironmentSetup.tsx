import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { getPaymentUrls } from '@/config/env';

const EnvironmentSetup = () => {
  const [isChecking, setIsChecking] = useState(false);

  const { data: envStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['environment-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('setup-environment');
      if (error) throw error;
      return data;
    },
    refetchOnWindowFocus: false
  });

  const handleCheckEnvironment = async () => {
    setIsChecking(true);
    try {
      await refetch();
      toast.success('Environment status updated');
    } catch (error: any) {
      toast.error('Failed to check environment: ' + error.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleTestPayment = async () => {
    try {
      const paymentUrls = getPaymentUrls();
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: 10,
          currency: 'BDT',
          customer_name: 'Test User',
          customer_email: 'test@healthythako.com',
          return_url: `${paymentUrls.successUrl}?test=true`,
          cancel_url: `${paymentUrls.cancelUrl}?test=true`,
          metadata: {
            test: true,
            user_id: 'test-user'
          }
        }
      });

      if (error) throw error;

      if (data.success && data.payment_url) {
        toast.success('Test payment created successfully!');
        window.open(data.payment_url, '_blank');
      } else {
        toast.error('Test payment failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      toast.error('Payment test failed: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Checking environment status...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Environment Check Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">Failed to check environment status: {error.message}</p>
          <Button onClick={handleCheckEnvironment} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Check
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isFullyConfigured = envStatus?.environment?.variables?.UDDOKTAPAY_API_KEY?.isSet &&
                           envStatus?.environment?.variables?.SUPABASE_URL?.isSet;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Environment Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
              {isFullyConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`font-medium ${isFullyConfigured ? 'text-green-700' : 'text-red-700'}`}>
                Environment: {isFullyConfigured ? 'Fully Configured' : 'Needs Setup'}
              </span>
            </div>

            {/* Environment Variables Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Required Variables:</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(envStatus?.environment?.variables || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center gap-2">
                      {value.isSet ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={value.isSet ? 'text-green-700' : 'text-red-700'}>
                        {key}: {value.isSet ? 'Set' : 'Missing'}
                        {key === 'UDDOKTAPAY_API_KEY' && value.length > 0 && (
                          <span className="text-gray-500 ml-1">({value.length} chars)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">API Test Results:</h4>
                {envStatus?.apiTest ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {envStatus.apiTest.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={envStatus.apiTest.success ? 'text-green-700' : 'text-red-700'}>
                        UddoktaPay API: {envStatus.apiTest.success ? 'Connected' : 'Failed'}
                      </span>
                    </div>
                    {!envStatus.apiTest.success && envStatus.apiTest.error && (
                      <p className="text-red-600 text-xs ml-6">{envStatus.apiTest.error}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No API test performed</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleCheckEnvironment} disabled={isChecking} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              
              {isFullyConfigured && (
                <Button onClick={handleTestPayment} className="bg-green-600 hover:bg-green-700">
                  Test Payment Integration
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {!isFullyConfigured && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <div className="space-y-4">
              <p><strong>To complete the environment setup:</strong></p>
              
              <div className="space-y-3">
                <div className="bg-yellow-100 p-3 rounded-md">
                  <p className="font-medium mb-2">1. Set Supabase Secrets:</p>
                  <div className="space-y-1 text-sm font-mono bg-gray-800 text-green-400 p-2 rounded">
                    <p>supabase secrets set UDDOKTAPAY_API_KEY="yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU"</p>
                    <p>supabase secrets set SUPABASE_URL="https://lhncpcsniuxnrmabbkmr.supabase.co"</p>
                  </div>
                </div>

                <div className="bg-yellow-100 p-3 rounded-md">
                  <p className="font-medium mb-2">2. Alternative - Supabase Dashboard:</p>
                  <p className="text-sm">Go to Project Settings → Edge Functions → Environment Variables</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.open('https://supabase.com/dashboard/project/lhncpcsniuxnrmabbkmr/settings/functions', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Supabase Dashboard
                  </Button>
                </div>

                <div className="bg-yellow-100 p-3 rounded-md">
                  <p className="font-medium mb-2">3. After Setting Variables:</p>
                  <p className="text-sm">Click "Refresh Status" above to verify the configuration</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      {envStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>Timestamp:</strong> {envStatus.timestamp}</p>
              <p><strong>Total Environment Variables:</strong> {envStatus.environment?.totalEnvVars}</p>
              <p><strong>UddoktaPay Variables Found:</strong> {Object.keys(envStatus.environment?.uddoktaVars || {}).length}</p>
              
              {envStatus.recommendations && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium mb-2">Recommendations:</p>
                  <ul className="space-y-1 text-xs">
                    <li>API Key Length: {envStatus.recommendations.apiKeyLength} / {envStatus.recommendations.expectedApiKeyLength} chars</li>
                    <li>Needs API Key: {envStatus.recommendations.needsApiKey ? 'Yes' : 'No'}</li>
                    <li>Needs Service Role: {envStatus.recommendations.needsServiceRole ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnvironmentSetup;

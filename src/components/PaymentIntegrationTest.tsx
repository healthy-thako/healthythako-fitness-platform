import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Play, CreditCard } from 'lucide-react';
import { getPaymentUrls } from '@/config/env';

const PaymentIntegrationTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsRunning(true);
    try {
      const result = await testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, result, error: null }
      }));
      toast.success(`${testName} test passed`);
      return result;
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, result: null, error: error.message }
      }));
      toast.error(`${testName} test failed: ${error.message}`);
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  const testEnvironmentSetup = async () => {
    return runTest('Environment Setup', async () => {
      const { data, error } = await supabase.functions.invoke('setup-environment');
      if (error) throw error;
      return data;
    });
  };

  const testPaymentCreation = async () => {
    return runTest('Payment Creation', async () => {
      const paymentUrls = getPaymentUrls();
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: 100,
          currency: 'BDT',
          customer_name: 'Test User',
          customer_email: 'test@healthythako.com',
          return_url: `${paymentUrls.successUrl}?test=true`,
          cancel_url: `${paymentUrls.cancelUrl}?test=true`,
          metadata: {
            test: true,
            user_id: user?.id || 'test-user',
            payment_type: 'test'
          }
        }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Payment creation failed');
      return data;
    });
  };

  const testTrainerBookingPayment = async () => {
    return runTest('Trainer Booking Payment', async () => {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: 1500,
          currency: 'BDT',
          customer_name: user?.user_metadata?.name || 'Test User',
          customer_email: user?.email || 'test@healthythako.com',
          return_url: `${window.location.origin}/payment-success?type=trainer_booking`,
          cancel_url: `${window.location.origin}/payment-cancelled?type=trainer_booking`,
          metadata: {
            booking_data: JSON.stringify({
              trainer_id: '177bf5ec-a35f-4833-be4f-a3efc7f4f257',
              trainer_name: 'Jake Rodriguez',
              package_type: 'basic',
              session_count: 1,
              mode: 'online',
              title: 'Test Training Session'
            }),
            user_id: user?.id || 'test-user',
            payment_type: 'trainer_booking'
          }
        }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Trainer booking payment failed');
      return data;
    });
  };

  const testGymMembershipPayment = async () => {
    return runTest('Gym Membership Payment', async () => {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: 2000,
          currency: 'BDT',
          customer_name: user?.user_metadata?.name || 'Test User',
          customer_email: user?.email || 'test@healthythako.com',
          return_url: `${window.location.origin}/payment-success?type=gym_membership`,
          cancel_url: `${window.location.origin}/payment-cancelled?type=gym_membership`,
          metadata: {
            gym_membership_data: JSON.stringify({
              gym_id: '60bb9206-91db-4617-a8c2-a001b879498c',
              gym_name: 'FitZone Elite',
              plan_id: 'monthly',
              plan_name: 'Monthly Membership',
              duration_days: 30
            }),
            user_id: user?.id || 'test-user',
            payment_type: 'gym_membership'
          }
        }
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Gym membership payment failed');
      return data;
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      await testEnvironmentSetup();
      await testPaymentCreation();
      await testTrainerBookingPayment();
      await testGymMembershipPayment();
      toast.success('All tests completed successfully!');
    } catch (error) {
      toast.error('Some tests failed. Check results below.');
    } finally {
      setIsRunning(false);
    }
  };

  const openPaymentUrl = (testName: string) => {
    const result = testResults[testName];
    if (result?.success && result.result?.payment_url) {
      window.open(result.result.payment_url, '_blank');
      toast.success('Payment URL opened in new tab');
    }
  };

  const TestResult = ({ testName, result }: { testName: string; result: any }) => (
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
          <p>✅ Test passed successfully</p>
          {result.result?.payment_url && (
            <Button 
              size="sm" 
              className="mt-2"
              onClick={() => openPaymentUrl(testName)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Open Payment URL
            </Button>
          )}
        </div>
      )}
      
      {result?.error && (
        <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
          <p>❌ Error: {result.error}</p>
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
            <Play className="h-5 w-5" />
            Payment Integration Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              <Button 
                onClick={testEnvironmentSetup} 
                disabled={isRunning}
                variant="outline"
              >
                Test Environment
              </Button>
              
              <Button 
                onClick={testPaymentCreation} 
                disabled={isRunning}
                variant="outline"
              >
                Test Payment Creation
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TestResult testName="Environment Setup" result={testResults['Environment Setup']} />
              <TestResult testName="Payment Creation" result={testResults['Payment Creation']} />
              <TestResult testName="Trainer Booking Payment" result={testResults['Trainer Booking Payment']} />
              <TestResult testName="Gym Membership Payment" result={testResults['Gym Membership Payment']} />
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Test Summary:</h3>
                <div className="text-sm space-y-1">
                  <p>Total Tests: {Object.keys(testResults).length}</p>
                  <p>Passed: {Object.values(testResults).filter((r: any) => r.success).length}</p>
                  <p>Failed: {Object.values(testResults).filter((r: any) => !r.success).length}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mobile App Deep Link Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Test deep links for mobile app integration:
            </p>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('healthythako://payment/success?type=trainer_booking&id=test123&amount=1500', '_blank')}
              >
                Test Success Deep Link
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('healthythako://payment/cancelled?type=gym_membership&reason=user_cancelled', '_blank')}
              >
                Test Cancel Deep Link
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('healthythako://payment/failed?type=service_order&error=payment_failed', '_blank')}
              >
                Test Failed Deep Link
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Note: Deep links will only work if you have the mobile app installed with proper URL scheme configuration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentIntegrationTest;

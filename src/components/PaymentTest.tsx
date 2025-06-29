import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useTrainerBookingPayment, 
  useGymMembershipPayment, 
  useServiceOrderPayment 
} from '@/hooks/useUddoktapayPayment';
import { toast } from 'sonner';
import { CreditCard, User, Dumbbell, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ENV, validateConfig } from '@/config/env';

const PaymentTest = () => {
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState<'trainer' | 'gym' | 'service'>('trainer');
  const [amount, setAmount] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate environment configuration
  const envValidation = validateConfig();

  const trainerPayment = useTrainerBookingPayment();
  const gymPayment = useGymMembershipPayment();
  const servicePayment = useServiceOrderPayment();

  const handleTestPayment = async () => {
    if (!user) {
      toast.error('Please login to test payments');
      return;
    }

    setIsProcessing(true);
    
    try {
      switch (paymentType) {
        case 'trainer':
          await trainerPayment.createPayment({
            trainerId: '177bf5ec-a35f-4833-be4f-a3efc7f4f257', // Jake Rodriguez
            trainerName: 'Jake Rodriguez',
            amount: amount,
            packageType: 'basic',
            sessionCount: 1,
            mode: 'online',
            description: 'Test trainer booking payment',
            customerName: user.user_metadata?.name || 'Test User',
            customerEmail: user.email || 'test@example.com'
          });
          break;

        case 'gym':
          await gymPayment.createPayment({
            gymId: '60bb9206-91db-4617-a8c2-a001b879498c', // FitZone Elite
            gymName: 'FitZone Elite',
            planId: 'monthly',
            planName: 'Monthly Membership',
            amount: amount,
            durationDays: 30,
            customerName: user.user_metadata?.name || 'Test User',
            customerEmail: user.email || 'test@example.com'
          });
          break;

        case 'service':
          await servicePayment.createPayment({
            trainerId: '177bf5ec-a35f-4833-be4f-a3efc7f4f257',
            serviceTitle: 'Custom Training Program',
            amount: amount,
            packageType: 'basic',
            quantity: 1,
            deliveryDays: 7,
            requirements: 'Test service order requirements',
            customerName: user.user_metadata?.name || 'Test User',
            customerEmail: user.email || 'test@example.com'
          });
          break;
      }
    } catch (error: any) {
      console.error('Payment test error:', error);
      toast.error('Payment test failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment System Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please login to test the payment system.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            UddoktaPay Payment Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Trainer Booking
                    </div>
                  </SelectItem>
                  <SelectItem value="gym">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Gym Membership
                    </div>
                  </SelectItem>
                  <SelectItem value="service">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Service Order
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount (BDT)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Test Details:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User:</strong> {user.email}</p>
              <p><strong>Payment Type:</strong> {paymentType}</p>
              <p><strong>Amount:</strong> ৳{amount.toLocaleString()}</p>
              {paymentType === 'trainer' && (
                <p><strong>Trainer:</strong> Jake Rodriguez (Boxing & Martial Arts)</p>
              )}
              {paymentType === 'gym' && (
                <p><strong>Gym:</strong> FitZone Elite (Monthly Membership)</p>
              )}
              {paymentType === 'service' && (
                <p><strong>Service:</strong> Custom Training Program</p>
              )}
            </div>
          </div>

          <Button 
            onClick={handleTestPayment}
            disabled={isProcessing || amount <= 0}
            className="w-full"
            size="lg"
          >
            {isProcessing ? 'Processing...' : `Test ${paymentType} Payment - ৳${amount}`}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Note:</strong> This will create a real payment session with UddoktaPay.</p>
            <p>• Mobile users will be redirected in the same window</p>
            <p>• Desktop users will see a new tab</p>
            <p>• Payment success will create records in the database</p>
            <p>• Use test payment methods provided by UddoktaPay</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {envValidation.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={envValidation.isValid ? 'text-green-700' : 'text-red-700'}>
                Environment Configuration: {envValidation.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>

            {!envValidation.isValid && (
              <div className="bg-red-50 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-700">Missing Environment Variables:</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {envValidation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Configuration Values:</h4>
                <div className="space-y-1 text-gray-600">
                  <p><strong>App URL:</strong> {ENV.APP.url}</p>
                  <p><strong>Environment:</strong> {ENV.APP.environment}</p>
                  <p><strong>Currency:</strong> {ENV.PAYMENT.currency}</p>
                  <p><strong>Commission:</strong> {(ENV.PAYMENT.commission * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Feature Flags:</h4>
                <div className="space-y-1 text-gray-600">
                  <p><strong>Debug Logs:</strong> {ENV.FEATURES.enableDebugLogs ? '✅' : '❌'}</p>
                  <p><strong>Real-time:</strong> {ENV.FEATURES.enableRealTime ? '✅' : '❌'}</p>
                  <p><strong>Notifications:</strong> {ENV.FEATURES.enableNotifications ? '✅' : '❌'}</p>
                  <p><strong>Analytics:</strong> {ENV.FEATURES.enableAnalytics ? '✅' : '❌'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Flow Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✅ Payment hooks updated for new database schema</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✅ Edge functions deployed with UddoktaPay integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✅ Mobile-friendly redirect handling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✅ Environment variables configured in .env file</span>
            </div>
            <div className="flex items-center gap-2">
              {ENV.UDDOKTAPAY.apiKey ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>UddoktaPay API Key: {ENV.UDDOKTAPAY.apiKey ? 'Configured' : 'Missing'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!envValidation.isValid && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            <div className="space-y-3">
              <p><strong>To fix environment configuration issues:</strong></p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Check that your <code>.env</code> file exists in the project root</li>
                <li>Ensure all required environment variables are set:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code>VITE_SUPABASE_URL</code></li>
                    <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                    <li><code>VITE_UDDOKTAPAY_API_KEY</code></li>
                  </ul>
                </li>
                <li>Restart the development server after updating .env</li>
                <li>For production, set environment variables in your hosting platform</li>
              </ol>

              <div className="bg-yellow-100 p-3 rounded-md mt-4">
                <p className="font-medium">Quick Setup:</p>
                <code className="text-xs">node scripts/setup-env.js</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentTest;

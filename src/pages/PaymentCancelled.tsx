
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const PaymentCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const gymId = searchParams.get('gym');
  const planId = searchParams.get('plan');

  useEffect(() => {
    toast.error('Payment was cancelled. You can try again anytime.');
  }, []);

  const handleRetryPayment = () => {
    if (gymId && planId) {
      navigate(`/booking-flow?gym=${gymId}&plan=${planId}`);
    } else if (gymId) {
      navigate(`/gym/${gymId}`);
    } else {
      navigate('/gym-membership');
    }
  };

  const handleBackToGym = () => {
    if (gymId) {
      navigate(`/gym/${gymId}`);
    } else {
      navigate('/gym-membership');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Payment Cancelled
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Why was my payment cancelled?
              </h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• You clicked the "Cancel" or "Back" button</li>
                <li>• The payment window was closed</li>
                <li>• There was an issue with your payment method</li>
                <li>• The session expired due to inactivity</li>
              </ul>
            </div>

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-pink-900 mb-2">Ready to Try Again?</h3>
              <p className="text-sm text-pink-800 mb-3">
                Your membership is still available. You can complete your payment anytime.
              </p>
              <ul className="space-y-1 text-sm text-pink-800">
                <li>• All gym plans and pricing remain the same</li>
                <li>• Your information is saved for easy checkout</li>
                <li>• Multiple payment methods available</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleBackToGym}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gym
              </Button>
              <Button
                onClick={handleRetryPayment}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Having trouble? Contact our{' '}
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-pink-600 hover:text-pink-700 underline"
                >
                  support team
                </button>{' '}
                for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancelled;

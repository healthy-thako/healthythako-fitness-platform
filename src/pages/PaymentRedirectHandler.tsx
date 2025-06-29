import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PaymentRedirectHandler = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract payment parameters from URL
  const invoiceId = searchParams.get('invoice_id') || searchParams.get('order_id');
  const status = searchParams.get('status');
  const paymentType = searchParams.get('type');
  const amount = searchParams.get('amount');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const handlePaymentRedirect = async () => {
      try {
        // Check if this is a cancellation
        if (status === 'cancelled' || status === 'CANCELLED') {
          setVerificationStatus('cancelled');
          toast.error('Payment was cancelled');
          return;
        }

        // Check if we have required parameters
        if (!invoiceId) {
          throw new Error('Missing payment invoice ID');
        }

        console.log('Processing payment redirect:', {
          invoiceId,
          status,
          paymentType,
          amount,
          transactionId
        });

        // Verify payment with our backend
        const { data: verificationResult, error: verificationError } = await supabase.functions.invoke('verify-payment', {
          body: {
            invoice_id: invoiceId,
            status: status,
            payment_type: paymentType,
            user_id: user?.id
          }
        });

        if (verificationError) {
          console.error('Payment verification error:', verificationError);
          throw new Error(`Payment verification failed: ${verificationError.message}`);
        }

        console.log('Payment verification result:', verificationResult);

        if (verificationResult.success && verificationResult.status === 'COMPLETED') {
          setVerificationStatus('success');
          setPaymentDetails({
            invoiceId,
            transactionId: verificationResult.transaction_id || transactionId,
            amount: verificationResult.amount || amount,
            paymentType,
            metadata: verificationResult.metadata
          });

          toast.success('Payment verified successfully!');

          // Redirect to appropriate success page after a delay
          setTimeout(() => {
            if (paymentType === 'trainer_booking') {
              navigate('/payment-success?type=trainer_booking&verified=true');
            } else if (paymentType === 'gym_membership') {
              navigate('/payment-success?type=gym_membership&verified=true');
            } else if (paymentType === 'service_order') {
              navigate('/payment-success?type=service_order&verified=true');
            } else {
              navigate('/payment-success?verified=true');
            }
          }, 3000);

        } else {
          throw new Error(verificationResult.error || 'Payment verification failed');
        }

      } catch (error: any) {
        console.error('Payment redirect handling error:', error);
        setVerificationStatus('failed');
        setError(error.message);
        toast.error(`Payment processing failed: ${error.message}`);
      }
    };

    handlePaymentRedirect();
  }, [invoiceId, status, paymentType, amount, transactionId, user?.id, navigate]);

  const handleRetry = () => {
    setVerificationStatus('loading');
    setError(null);
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    toast.info('Please contact support with your transaction details');
    // You can implement support contact logic here
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Processing Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please wait while we verify your payment...
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              {invoiceId && <p>Invoice ID: {invoiceId}</p>}
              {paymentType && <p>Payment Type: {paymentType}</p>}
              {amount && <p>Amount: ৳{amount}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>
            
            {paymentDetails && (
              <div className="bg-green-50 p-4 rounded-lg mb-4 text-left">
                <h4 className="font-medium text-green-800 mb-2">Payment Details:</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Transaction ID:</strong> {paymentDetails.transactionId}</p>
                  <p><strong>Amount:</strong> ৳{paymentDetails.amount}</p>
                  <p><strong>Type:</strong> {paymentDetails.paymentType}</p>
                  <p><strong>Invoice ID:</strong> {paymentDetails.invoiceId}</p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              Redirecting to confirmation page in a few seconds...
            </p>

            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/payment-success?verified=true')} 
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                View Order Details
              </Button>
              <Button 
                onClick={handleGoHome} 
                variant="outline" 
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-800">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Your payment was cancelled. No charges have been made.
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.history.back()} 
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                onClick={handleGoHome} 
                variant="outline" 
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            There was an issue processing your payment.
          </p>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-lg mb-4 text-left">
              <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={handleRetry} 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Verification
            </Button>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline" 
              className="w-full"
            >
              Try Payment Again
            </Button>
            <Button 
              onClick={handleContactSupport} 
              variant="outline" 
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentRedirectHandler;

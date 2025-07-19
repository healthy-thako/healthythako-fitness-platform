
import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BrandLoadingSpinner from '@/components/BrandLoadingSpinner';
import { toast } from 'sonner';

interface PaymentProtectedRouteProps {
  children: React.ReactNode;
  type: 'success' | 'cancelled';
}

const PaymentProtectedRoute: React.FC<PaymentProtectedRouteProps> = ({ 
  children, 
  type 
}) => {
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const validatePaymentRedirect = async () => {
      try {
        // For success page, we need at least one identifier
        if (type === 'success') {
          if (!sessionId && !bookingId && !transactionId) {
            toast.error('Invalid payment redirect - missing payment information');
            setIsValid(false);
            setIsValidating(false);
            return;
          }

          // Validate booking exists if bookingId provided
          if (bookingId) {
            const { data: booking, error } = await supabase
              .from('trainer_bookings')
              .select('id, status')
              .eq('id', bookingId)
              .single();

            if (error || !booking) {
              toast.error('Invalid booking reference');
              setIsValid(false);
              setIsValidating(false);
              return;
            }
          }

          // Validate transaction exists if transactionId provided
          if (transactionId) {
            const { data: transaction, error } = await supabase
              .from('payment_transactions')
              .select('id, status')
              .eq('id', transactionId)
              .single();

            if (error || !transaction) {
              toast.error('Invalid transaction reference');
              setIsValid(false);
              setIsValidating(false);
              return;
            }
          }
        }

        // For cancelled page, less strict validation
        setIsValid(true);
      } catch (error) {
        console.error('Payment redirect validation error:', error);
        toast.error('Error validating payment redirect');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validatePaymentRedirect();
  }, [sessionId, bookingId, transactionId, type]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <BrandLoadingSpinner size="lg" showText={true} />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PaymentProtectedRoute;

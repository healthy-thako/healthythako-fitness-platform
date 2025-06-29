
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { APP_CONFIG, PAYMENT_CONFIG, MOBILE_CONFIG, debugLog, getPaymentUrls, getAppUrl, isMobileApp, isMobileDevice } from '@/config/env';

interface CreatePaymentParams {
  amount: number;
  currency?: string;
  return_url?: string;
  cancel_url?: string;
  customer_email?: string;
  customer_name?: string;
  booking_id?: string;
  metadata?: any;
  payment_type?: 'trainer_booking' | 'gym_membership' | 'service_order';
  redirect_after_payment?: boolean;
}

interface VerifyPaymentParams {
  invoice_id: string;
}

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (params: CreatePaymentParams) => {
      console.log('Creating payment with params:', params);

      // Get dynamic URLs based on current environment and payment type
      const paymentType = params.payment_type || 'general';
      const paymentUrls = getPaymentUrls(paymentType);
      const appUrl = getAppUrl();

      // Detect mobile environment
      const isInMobileApp = isMobileApp();
      const isOnMobileDevice = isMobileDevice();

      console.log('Payment environment detection:', {
        isInMobileApp,
        isOnMobileDevice,
        paymentType,
        paymentUrls
      });

      // Merge dynamic URLs with params, giving priority to explicitly passed URLs
      const paymentParams = {
        ...params,
        return_url: params.return_url || paymentUrls.redirectUrl,
        cancel_url: params.cancel_url || paymentUrls.cancelUrl,
        metadata: {
          ...params.metadata,
          app_url: appUrl,
          redirect_url: paymentUrls.redirectUrl,
          success_url: paymentUrls.successUrl,
          cancel_url: paymentUrls.cancelUrl,
          is_mobile_app: isInMobileApp,
          is_mobile_device: isOnMobileDevice,
          payment_type: paymentType,
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
        }
      };

      console.log('Payment creation with dynamic URLs:', paymentParams);

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: paymentParams
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Payment creation response:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      if (data.success && data.payment_url) {
        debugLog('Opening payment URL:', data.payment_url);

        // Check if we should redirect in the same window (for mobile app compatibility)
        const isInMobileApp = isMobileApp();
        const isOnMobileDevice = isMobileDevice();
        const shouldRedirectSameWindow = variables.redirect_after_payment || isInMobileApp || isOnMobileDevice;

        if (shouldRedirectSameWindow) {
          // Redirect in the same window for better mobile app compatibility
          window.location.href = data.payment_url;
          toast.success('Redirecting to payment gateway...');
        } else {
          // Open in new tab for desktop
          const newWindow = window.open(data.payment_url, '_blank');

          if (!newWindow) {
            toast.error('Please allow popups for this site to complete payment');
            // Fallback to same window redirect
            window.location.href = data.payment_url;
          } else {
            toast.success('Payment window opened - complete your payment in the new tab. You will be redirected after successful payment.');
          }
        }
      } else {
        console.error('Payment creation failed:', data);
        toast.error('Failed to create payment session');
      }
    },
    onError: (error: any) => {
      console.error('Payment creation error:', error);
      toast.error(error.message || 'Failed to create payment');
    }
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async (params: VerifyPaymentParams) => {
      console.log('Verifying payment with params:', params);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: params
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Payment verification response:', data);
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.status === 'COMPLETED') {
        console.log('Payment verified successfully:', data);
        toast.success('Payment verified successfully');
      } else if (data.status === 'PENDING') {
        console.log('Payment still pending:', data);
        toast.info('Payment is being processed');
      } else {
        console.error('Payment verification failed:', data);
        toast.error('Payment verification failed');
      }
    },
    onError: (error: any) => {
      console.error('Payment verification error:', error);
      toast.error(error.message || 'Failed to verify payment');
    }
  });
};

// Helper functions for different payment types
export const useTrainerBookingPayment = () => {
  const createPayment = useCreatePayment();

  return {
    createPayment: (params: {
      trainerId: string;
      trainerName: string;
      amount: number;
      packageType: string;
      sessionCount: number;
      mode: string;
      scheduledDate?: string;
      scheduledTime?: string;
      description?: string;
      customerEmail?: string;
      customerName?: string;
    }) => {
      const bookingData = {
        trainer_id: params.trainerId,
        trainer_name: params.trainerName,
        package_type: params.packageType,
        session_count: params.sessionCount,
        mode: params.mode,
        scheduled_date: params.scheduledDate,
        scheduled_time: params.scheduledTime,
        description: params.description,
        title: `Training Session with ${params.trainerName}`
      };

      return createPayment.mutateAsync({
        amount: params.amount,
        customer_email: params.customerEmail,
        customer_name: params.customerName,
        payment_type: 'trainer_booking',
        redirect_after_payment: true,
        return_url: `${APP_CONFIG.url}/payment-redirect?type=trainer_booking`,
        cancel_url: `${APP_CONFIG.url}/payment-cancelled?type=trainer_booking`,
        metadata: {
          booking_data: JSON.stringify(bookingData),
          trainer_id: params.trainerId,
          payment_type: 'trainer_booking'
        }
      });
    },
    isLoading: createPayment.isPending
  };
};

export const useGymMembershipPayment = () => {
  const createPayment = useCreatePayment();

  return {
    createPayment: (params: {
      gymId: string;
      gymName: string;
      planId: string;
      planName: string;
      amount: number;
      durationDays: number;
      customerEmail?: string;
      customerName?: string;
    }) => {
      const membershipData = {
        gym_id: params.gymId,
        gym_name: params.gymName,
        plan_id: params.planId,
        plan_name: params.planName,
        duration_days: params.durationDays
      };

      return createPayment.mutateAsync({
        amount: params.amount,
        customer_email: params.customerEmail,
        customer_name: params.customerName,
        payment_type: 'gym_membership',
        redirect_after_payment: true,
        return_url: `${APP_CONFIG.url}/payment-redirect?type=gym_membership&gym=${params.gymId}&plan=${params.planId}`,
        cancel_url: `${APP_CONFIG.url}/payment-cancelled?type=gym_membership`,
        metadata: {
          gym_membership_data: JSON.stringify(membershipData),
          gym_id: params.gymId,
          payment_type: 'gym_membership'
        }
      });
    },
    isLoading: createPayment.isPending
  };
};

export const useServiceOrderPayment = () => {
  const createPayment = useCreatePayment();

  return {
    createPayment: (params: {
      trainerId: string;
      serviceTitle: string;
      amount: number;
      packageType: string;
      quantity: number;
      deliveryDays: number;
      requirements: string;
      additionalNotes?: string;
      urgentDelivery?: boolean;
      customerEmail?: string;
      customerName?: string;
    }) => {
      const serviceData = {
        trainer_id: params.trainerId,
        service_title: params.serviceTitle,
        package_type: params.packageType,
        quantity: params.quantity,
        delivery_days: params.deliveryDays,
        requirements: params.requirements,
        additional_notes: params.additionalNotes,
        urgent_delivery: params.urgentDelivery
      };

      return createPayment.mutateAsync({
        amount: params.amount,
        customer_email: params.customerEmail,
        customer_name: params.customerName,
        payment_type: 'service_order',
        redirect_after_payment: true,
        return_url: `${APP_CONFIG.url}/payment-redirect?type=service_order`,
        cancel_url: `${APP_CONFIG.url}/payment-cancelled?type=service_order`,
        metadata: {
          service_order_data: JSON.stringify(serviceData),
          trainer_id: params.trainerId,
          payment_type: 'service_order'
        }
      });
    },
    isLoading: createPayment.isPending
  };
};

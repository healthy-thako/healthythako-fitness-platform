import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Calendar, CreditCard, ArrowRight, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedCreateConversation } from '@/hooks/useUnifiedMessaging';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const createConversation = useUnifiedCreateConversation();
  
  const gymId = searchParams.get('gym');
  const planId = searchParams.get('plan');
  const orderId = searchParams.get('order');
  const bookingId = searchParams.get('booking_id');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (bookingId) {
          // Fetch booking details - Updated for new schema
          const { data: booking, error } = await supabase
            .from('trainer_bookings')
            .select(`
              *,
              trainers!trainer_bookings_trainer_id_fkey(id, name, email),
              transactions!transactions_booking_id_fkey(*)
            `)
            .eq('id', bookingId)
            .single();

          if (error) throw error;

          setOrderDetails({
            type: 'service_order',
            ...booking,
            trainer: booking.trainers
          });

          // Determine order type from booking data (updated for new schema)
          const isServiceOrder = booking.notes?.includes('Service Order Details:') ||
                               booking.service_type?.toLowerCase().includes('service');

          if (isServiceOrder && booking.trainers) {
            // Create conversation for service order
            try {
              const initialMessage = `Hello! I've just placed a service order for "${booking.service_type}".

Order Details:
- Amount: ৳${booking.total_amount}
- Requirements: ${booking.description}
- Expected delivery: ${booking.session_duration ? Math.floor(booking.session_duration / (24 * 60)) : 'N/A'} days

Looking forward to working with you!`;

              await createConversation.mutateAsync({
                receiverId: booking.trainers.id,
                initialMessage,
                bookingId: booking.id
              });

              toast.success('Conversation started with your trainer!');
            } catch (convError) {
              console.error('Error creating conversation:', convError);
              // Don't show error to user - payment was successful
            }
          }

          toast.success(isServiceOrder ? 'Service order placed successfully!' : 'Booking confirmed successfully!');
        } else if (gymId) {
          // Gym membership
          setOrderDetails({
            type: 'gym_membership',
            gymId,
            planId
          });
          toast.success('Gym membership activated successfully!');
        } else {
          // Generic success
          setOrderDetails({
            type: 'general',
            orderId
          });
          toast.success('Payment completed successfully!');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Payment successful, but failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [bookingId, gymId, planId, orderId, createConversation]);

  const handleViewGym = () => {
    if (gymId) {
      navigate(`/gym/${gymId}`);
    } else {
      navigate('/gym-membership');
    }
  };

  const handleViewDashboard = () => {
    navigate('/client-dashboard');
  };

  const handleStartConversation = () => {
    if (orderDetails?.trainer?.id) {
      navigate('/client-dashboard/messages', {
        state: { 
          startConversation: true, 
          trainerId: orderDetails.trainer.id 
        }
      });
    }
  };

  const getSuccessMessage = () => {
    if (orderDetails?.type === 'service_order') {
      return {
        title: 'Service Order Placed Successfully!',
        subtitle: 'Your order has been sent to the trainer for processing.',
        description: 'The trainer will review your requirements and start working on your order.'
      };
    } else if (orderDetails?.type === 'gym_membership') {
      return {
        title: 'Gym Membership Activated!',
        subtitle: 'Your gym membership has been activated successfully.',
        description: 'You can now access all gym facilities and services.'
      };
    } else {
      return {
        title: 'Payment Successful!',
        subtitle: 'Your payment has been processed successfully.',
        description: 'Thank you for your purchase.'
      };
    }
  };

  const getNextSteps = () => {
    if (orderDetails?.type === 'service_order') {
      return [
        '• The trainer has been notified about your order',
        '• You can chat with the trainer for any clarifications',
        '• Track order progress in your dashboard',
        '• You\'ll receive updates as work progresses'
      ];
    } else if (orderDetails?.type === 'gym_membership') {
      return [
        '• You\'ll receive a confirmation email with membership details',
        '• Visit the gym with a valid ID to complete registration',
        '• Download the gym\'s mobile app (if available) for easy access',
        '• Check your dashboard for membership status and updates'
      ];
    } else {
      return [
        '• You\'ll receive a confirmation email shortly',
        '• Check your dashboard for updates',
        '• Contact support if you have any questions'
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const successInfo = getSuccessMessage();
  const nextSteps = getNextSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              {successInfo.title}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {successInfo.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Details */}
            {(orderId || bookingId) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-gray-900">{orderId || bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                  {orderDetails?.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-900">৳{orderDetails.amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trainer Info for Service Orders */}
            {orderDetails?.type === 'service_order' && orderDetails?.trainer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Trainer
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{orderDetails.trainer.name}</p>
                    <p className="text-sm text-blue-700">{orderDetails.trainer.email}</p>
                  </div>
                  <Button
                    onClick={handleStartConversation}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat Now
                  </Button>
                </div>
              </div>
            )}

            {/* What's Next Section */}
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-pink-900 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                What's Next?
              </h3>
              <ul className="space-y-2 text-sm text-pink-800">
                {nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orderDetails?.type === 'gym_membership' ? (
                <Button
                  onClick={handleViewGym}
                  variant="outline"
                  className="border-pink-600 text-pink-600 hover:bg-pink-50"
                >
                  View Gym Details
                </Button>
              ) : orderDetails?.type === 'service_order' && orderDetails?.trainer ? (
                <Button
                  onClick={handleStartConversation}
                  variant="outline"
                  className="border-pink-600 text-pink-600 hover:bg-pink-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Trainer
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/find-trainers')}
                  variant="outline"
                  className="border-pink-600 text-pink-600 hover:bg-pink-50"
                >
                  Browse Services
                </Button>
              )}
              <Button
                onClick={handleViewDashboard}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Need help? Contact our{' '}
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-pink-600 hover:text-pink-700 underline"
                >
                  support team
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Verify payment request body:', requestBody);
    
    // Get UddoktaPay API key from environment variables
    const uddoktapayApiKey = Deno.env.get('UDDOKTAPAY_API_KEY') ||
                             Deno.env.get('VITE_UDDOKTAPAY_API_KEY') ||
                             Deno.env.get('UDDOKTAPAY_API');

    if (!uddoktapayApiKey) {
      console.error('UddoktaPay API key not found in environment variables');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => key.includes('UDDOKTA')));
      throw new Error('Payment API key not configured. Please check environment variables.');
    }

    console.log('UddoktaPay API key found, length:', uddoktapayApiKey.length);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Handle both webhook calls and manual verification calls
    let invoice_id;
    
    if (requestBody.invoice_id) {
      // Manual verification call
      invoice_id = requestBody.invoice_id;
    } else if (requestBody.order_id) {
      // Webhook call - UddoktaPay sends order_id in webhook
      invoice_id = requestBody.order_id;
    } else {
      throw new Error('No invoice_id or order_id provided');
    }

    console.log('Verifying payment for invoice_id:', invoice_id);

    // Verify payment with UddoktaPay using the correct endpoint
    const verifyData = {
      invoice_id: invoice_id
    };

    const response = await fetch('https://digitaldot.paymently.io/api/verify-payment', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': uddoktapayApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('UddoktaPay verification error:', result);
      throw new Error(`Payment verification failed: ${result.message || 'Unknown error'}`);
    }

    console.log('Payment verification result:', result);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create booking and transaction if payment is successful
    if (result.status === 'COMPLETED') {
      try {
        // Handle different payment types based on metadata
        if (result.metadata?.service_order_data) {
          // Service/Gig order - Updated for new schema
          const orderData = JSON.parse(result.metadata.service_order_data);
          console.log('Creating service order:', orderData);

          const { data: newBooking, error: orderError } = await supabase
            .from('trainer_bookings')
            .insert({
              user_id: result.metadata.user_id,
              trainer_id: orderData.trainer_id,
              service_type: orderData.service_title || 'Training Service',
              description: `Service Order: ${orderData.requirements}${orderData.additional_notes ? '\n\nAdditional Notes: ' + orderData.additional_notes : ''}`,
              package_type: orderData.package_type || 'basic',
              session_count: orderData.quantity || 1,
              session_duration: orderData.delivery_days * 24 * 60, // Convert days to minutes for duration tracking
              booking_type: 'online', // Service orders are typically online/remote
              total_amount: parseFloat(result.amount),
              status: 'pending', // Service orders start as pending for trainer acceptance
              notes: `Service Order Details:
- Package: ${orderData.package_type}
- Quantity: ${orderData.quantity}
- Delivery Days: ${orderData.delivery_days}
- Urgent: ${orderData.urgent_delivery ? 'Yes' : 'No'}
- Requirements: ${orderData.requirements}`,
              payment_status: 'completed',
              payment_method: 'uddoktapay',
              transaction_id: result.session_id || result.invoice_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (orderError) {
            console.error('Error creating service order:', orderError);
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to create service order' 
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          console.log('Service order created successfully:', newBooking);

          // Create transaction record for service order
          await createServiceOrderTransaction(supabase, newBooking, orderData, result);

        } else if (result.metadata?.gym_membership_data) {
          // Gym membership - Updated for new schema
          const membershipData = JSON.parse(result.metadata.gym_membership_data);
          console.log('Creating gym membership:', membershipData);

          // Calculate membership end date based on plan
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + (membershipData.duration_days || 30));

          const { data: newMembership, error: membershipError } = await supabase
            .from('user_memberships')
            .insert({
              user_id: result.metadata.user_id,
              gym_id: membershipData.gym_id,
              plan_id: membershipData.plan_id,
              amount_paid: parseFloat(result.amount),
              payment_status: 'completed',
              payment_method: 'uddoktapay',
              transaction_id: result.session_id || result.invoice_id,
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (membershipError) {
            console.error('Error creating gym membership:', membershipError);
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to create gym membership',
              details: membershipError.message
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          console.log('Gym membership created successfully:', newMembership);

          // Create transaction record for gym membership
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              user_id: result.metadata.user_id,
              gym_id: membershipData.gym_id,
              membership_id: newMembership.id,
              amount: parseFloat(result.amount),
              payment_method: 'uddoktapay',
              status: 'completed',
              transaction_date: new Date().toISOString(),
              payment_session_id: result.session_id || result.invoice_id,
              description: `Gym membership payment for ${membershipData.gym_name || 'gym'}`
            });

          if (transactionError) {
            console.error('Error creating transaction for gym membership:', transactionError);
          }

          // Create notifications for gym membership
          await supabase
            .from('notifications')
            .insert([
              {
                user_id: result.metadata.user_id,
                type: 'membership_activated',
                title: 'Gym Membership Activated',
                message: `Your gym membership has been activated successfully!`,
                related_id: newMembership.id
              }
            ]);

          // Update gym member count (if applicable)
          await supabase.rpc('increment_gym_member_count', { 
            gym_id: membershipData.gym_id 
          });

          // Set redirect URL for gym memberships - use dynamic origin
          const baseUrl = result.metadata.origin || result.metadata.app_url || 'https://healthythako.com';
          result.redirect_url = `${baseUrl}/payment-success?membership_id=${newMembership.id}&type=gym_membership`;

        } else {
          // Trainer session booking - Updated for new schema
          const bookingData = JSON.parse(result.metadata.booking_data || '{}');
          console.log('Creating trainer booking:', bookingData);

          const { data: newBooking, error: bookingError } = await supabase
            .from('trainer_bookings')
            .insert({
              user_id: result.metadata.user_id,
              trainer_id: bookingData.trainer_id,
              service_type: bookingData.title || `Training Session with ${bookingData.trainer_name}`,
              description: bookingData.description,
              scheduled_date: bookingData.scheduled_date,
              scheduled_time: bookingData.scheduled_time,
              booking_type: bookingData.mode || 'online',
              session_count: bookingData.session_count || 1,
              package_type: bookingData.package_type || 'basic',
              total_amount: parseFloat(result.amount),
              status: 'confirmed',
              payment_status: 'completed',
              payment_method: 'uddoktapay',
              transaction_id: result.session_id || result.invoice_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (bookingError) {
            console.error('Error creating booking:', bookingError);
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Failed to create booking' 
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          console.log('Trainer booking created successfully:', newBooking);

          // Create transaction record for trainer booking
          await createTrainerBookingTransaction(supabase, newBooking, result);
        }

        console.log('Successfully processed payment and created records');

      } catch (error) {
        console.error('Error processing successful payment:', error);
        // Still return success response as payment was successful, but log the error
      }
    }

    // Return success with redirect URL if available
    return new Response(
      JSON.stringify({
        success: true,
        status: result.status,
        transaction_id: result.transaction_id,
        amount: result.amount,
        metadata: result.metadata,
        redirect_url: result.redirect_url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper functions - Updated for new schema
async function createServiceOrderTransaction(supabase: any, booking: any, orderData: any, result: any) {
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: result.metadata.user_id,
      trainer_id: orderData.trainer_id,
      booking_id: booking.id,
      amount: parseFloat(result.amount),
      commission: parseFloat(result.amount) * 0.1,
      net_amount: parseFloat(result.amount) * 0.9,
      payment_method: 'uddoktapay',
      status: 'completed',
      transaction_date: new Date().toISOString(),
      payment_session_id: result.session_id || result.invoice_id,
      description: `Service order payment for ${orderData.service_title || 'training service'}`
    });

  if (transactionError) {
    console.error('Error creating transaction for service order:', transactionError);
  }

  // Create notifications
  await supabase
    .from('notifications')
    .insert([
      {
        user_id: result.metadata.user_id,
        type: 'service_order_placed',
        title: 'Service Order Placed',
        message: `Your service order "${orderData.service_title}" has been placed successfully!`,
        related_id: booking.id
      },
      {
        user_id: orderData.trainer_id,
        type: 'new_service_order',
        title: 'New Service Order',
        message: `You have received a new service order: "${orderData.service_title}"`,
        related_id: booking.id
      }
    ]);
}

async function createTrainerBookingTransaction(supabase: any, booking: any, result: any) {
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: result.metadata.user_id,
      trainer_id: result.metadata.trainer_id || booking.trainer_id,
      booking_id: booking.id,
      amount: parseFloat(result.amount),
      commission: parseFloat(result.amount) * 0.1,
      net_amount: parseFloat(result.amount) * 0.9,
      payment_method: 'uddoktapay',
      status: 'completed',
      transaction_date: new Date().toISOString(),
      payment_session_id: result.session_id || result.invoice_id,
      description: `Trainer booking payment for ${booking.service_type || 'training session'}`
    });

  if (transactionError) {
    console.error('Error creating transaction for trainer booking:', transactionError);
  }

  // Create notifications
  await supabase
    .from('notifications')
    .insert([
      {
        user_id: result.metadata.user_id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: 'Your training session has been confirmed!',
        related_id: booking.id
      },
      {
        user_id: result.metadata.trainer_id,
        type: 'new_booking',
        title: 'New Booking',
        message: 'You have received a new booking!',
        related_id: booking.id
      }
    ]);
}

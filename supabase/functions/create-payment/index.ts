import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { amount, currency = 'BDT', return_url, cancel_url, customer_email, customer_name, booking_id, metadata } = await req.json();
    
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

    console.log('Creating payment session for amount:', amount, 'currency:', currency);
    console.log('Metadata received:', metadata);

    // Get origin from request headers for dynamic URL resolution
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://healthythako.com';
    console.log('Request origin:', origin);

    // Determine if this is a mobile app request
    const isMobileApp = metadata?.is_mobile_app || false;
    const paymentType = metadata?.payment_type || 'general';

    // Generate appropriate redirect URLs
    let finalRedirectUrl, finalCancelUrl;

    if (isMobileApp) {
      // Use deep links for mobile app
      finalRedirectUrl = `healthythako://payment/success?type=${paymentType}`;
      finalCancelUrl = `healthythako://payment/cancelled?type=${paymentType}`;
    } else {
      // Use web URLs with dynamic origin resolution
      finalRedirectUrl = return_url || `${origin}/payment-redirect`;
      finalCancelUrl = cancel_url || `${origin}/payment-cancelled`;
    }

    console.log('Final redirect URLs:', { finalRedirectUrl, finalCancelUrl });

    // Create payment session with UddoktaPay API v2 - using exact API specification
    const paymentData = {
      full_name: customer_name || "Customer",
      email: customer_email || "customer@healthythako.com",
      amount: amount.toString(), // Convert to string as per API docs
      metadata: {
        ...metadata,
        origin: origin,
        is_mobile_app: isMobileApp,
        payment_type: paymentType
      },
      redirect_url: finalRedirectUrl,
      cancel_url: finalCancelUrl,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/uddoktapay-webhook`
    };

    console.log('Payment data being sent to UddoktaPay:', paymentData);

    const response = await fetch('https://digitaldot.paymently.io/api/checkout-v2', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': uddoktapayApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('UddoktaPay API error:', result);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`Payment creation failed: ${result.message || result.error || 'Unknown error'}`);
    }

    console.log('Payment session created successfully:', result);

    // Handle different response formats from UddoktaPay
    let paymentUrl = result.payment_url || result.checkout_url || result.url;
    let invoiceId = result.invoice_id || result.session_id || result.id;
    let sessionId = result.session_id || result.invoice_id || result.id;

    if (!paymentUrl) {
      console.error('No payment URL in response:', result);
      throw new Error('Payment URL not provided by payment gateway');
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        invoice_id: invoiceId,
        session_id: sessionId,
        full_response: result // Include full response for debugging
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack || 'No stack trace available'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

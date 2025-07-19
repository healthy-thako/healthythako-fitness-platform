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
    // Get all environment variables
    const env = Deno.env.toObject();
    
    // Check critical environment variables
    const criticalVars = {
      'UDDOKTAPAY_API_KEY': Deno.env.get('UDDOKTAPAY_API_KEY'),
      'UDDOKTAPAY_API': Deno.env.get('UDDOKTAPAY_API'),
      'VITE_UDDOKTAPAY_API_KEY': Deno.env.get('VITE_UDDOKTAPAY_API_KEY'),
      'SUPABASE_URL': Deno.env.get('SUPABASE_URL'),
      'SUPABASE_SERVICE_ROLE_KEY': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      'SUPABASE_ANON_KEY': Deno.env.get('SUPABASE_ANON_KEY')
    };

    // Check which variables are set
    const status = {};
    for (const [key, value] of Object.entries(criticalVars)) {
      status[key] = {
        exists: !!value,
        length: value ? value.length : 0,
        preview: value ? `${value.substring(0, 10)}...` : 'NOT SET'
      };
    }

    // List all environment variables that contain 'UDDOKTA' or 'SUPABASE'
    const relevantEnvVars = Object.keys(env).filter(key => 
      key.includes('UDDOKTA') || key.includes('SUPABASE') || key.includes('API')
    );

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      criticalVariables: status,
      relevantEnvVars,
      totalEnvVars: Object.keys(env).length,
      message: 'Environment test completed'
    };

    return new Response(
      JSON.stringify(response, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Environment test error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

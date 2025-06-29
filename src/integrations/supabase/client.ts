// Supabase client configuration with environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG, debugLog } from '@/config/env';

// Use environment variables with fallbacks
const SUPABASE_URL = SUPABASE_CONFIG.url;
const SUPABASE_PUBLISHABLE_KEY = SUPABASE_CONFIG.anonKey;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

debugLog('Supabase client initialized with URL:', SUPABASE_URL);

// Create a custom header function to include admin session token
export const getAdminHeaders = () => {
  const headers: Record<string, string> = {};
  
  // Check if admin session token exists
  const adminToken = localStorage.getItem('admin_session_token');
  if (adminToken) {
    headers['x-admin-session-token'] = adminToken;
  }
  
  return headers;
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
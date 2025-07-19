// Supabase client configuration with environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_CONFIG, debugLog } from '@/config/env';

// Use environment variables with fallbacks - ensure proper loading
const SUPABASE_URL = SUPABASE_CONFIG.url || 'https://lhncpcsniuxnrmabbkmr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = SUPABASE_CONFIG.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U';

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Supabase configuration missing:', {
    url: SUPABASE_URL,
    keyLength: SUPABASE_PUBLISHABLE_KEY?.length
  });
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

debugLog('Supabase client initialized with URL:', SUPABASE_URL);
debugLog('Supabase anon key length:', SUPABASE_PUBLISHABLE_KEY.length);

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
    detectSessionInUrl: true,
    // Simple retry configuration
    retryAttempts: 3,
    // Handle storage events to sync across tabs
    storageKey: 'supabase.auth.token',
    // Custom storage implementation with error handling
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    },
    // Ensure proper session flow
    flowType: 'pkce'
  },
  // Enhanced global configuration
  global: {
    headers: {
      'x-client-info': 'healthythako-web-app',
      'apikey': SUPABASE_PUBLISHABLE_KEY,
    },
  },
  // Disable realtime completely to prevent WebSocket connection issues
  realtime: {
    params: {
      eventsPerSecond: 0, // Disable realtime events
    },
  },
  // Optimized database configuration
  db: {
    schema: 'public',
  },
});

// Add error handling for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    debugLog('Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    debugLog('User signed out');
    // Clear any cached data
    try {
      localStorage.removeItem('admin_session_token');
    } catch (error) {
      console.error('Error clearing admin session:', error);
    }
  }
});

// Utility function to handle auth errors
export const handleAuthError = async (error: any) => {
  if (error?.message?.includes('refresh') || error?.message?.includes('token')) {
    console.warn('Invalid refresh token detected, signing out user');
    await supabase.auth.signOut();
    return true; // Indicates that we handled the error
  }
  return false; // Indicates that we didn't handle the error
};

// Optimized RPC call utility with timeout and retry logic
export const callRPCWithTimeout = async <T>(
  functionName: string,
  params: any = {},
  options: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<{ data: T | null; error: any }> => {
  const {
    timeout = 20000, // Reduced to 20 seconds for faster response
    retries = 1, // Reduced retries for faster response
    retryDelay = 1000 // Reduced retry delay
  } = options;

  let lastError: any = null;
  const startTime = Date.now();

  debugLog(`🚀 Starting RPC call ${functionName} with params:`, params);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const attemptStartTime = Date.now();

    try {
      debugLog(`⏳ Attempting RPC call ${functionName} (attempt ${attempt + 1}/${retries + 1})`);

      // Set up timeout for this attempt
      let timeoutId: NodeJS.Timeout;

      try {
        // Use Promise.race with timeout
        const rpcPromise = supabase.rpc(functionName, params);
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('RPC timeout')), timeout);
        });

        const result = await Promise.race([rpcPromise, timeoutPromise]);

        if (timeoutId) clearTimeout(timeoutId);
        const attemptDuration = Date.now() - attemptStartTime;

        if (result.error) {
          lastError = result.error;
          debugLog(`❌ RPC call ${functionName} failed with error (${attemptDuration}ms):`, result.error);

          // Don't retry on certain types of errors
          if (result.error.code === 'PGRST116' ||
              result.error.message?.includes('permission') ||
              result.error.message?.includes('not found')) {
            debugLog(`🚫 Not retrying ${functionName} due to error type`);
            break;
          }

          if (attempt < retries) {
            debugLog(`🔄 Retrying RPC call ${functionName} in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        } else {
          const totalDuration = Date.now() - startTime;
          debugLog(`✅ RPC call ${functionName} successful (${attemptDuration}ms, total: ${totalDuration}ms)`);
          debugLog(`📊 RPC result data length:`, Array.isArray(result.data) ? result.data.length : 'not array');
          return result;
        }
      } catch (fetchError) {
        if (timeoutId) clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      lastError = error;
      const attemptDuration = Date.now() - attemptStartTime;

      if (error.name === 'AbortError') {
        debugLog(`⏰ RPC call ${functionName} attempt ${attempt + 1} timed out (${attemptDuration}ms)`);
      } else {
        debugLog(`💥 RPC call ${functionName} attempt ${attempt + 1} failed (${attemptDuration}ms):`, error);
      }

      if (attempt < retries) {
        debugLog(`🔄 Retrying RPC call ${functionName} in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  debugLog(`❌ RPC call ${functionName} failed after all attempts (${totalDuration}ms):`, lastError);
  return { data: null, error: lastError };
};

// Enhanced query utility with retry mechanism and extended timeout handling
export const queryWithTimeout = async <T>(
  query: any,
  timeout: number = 30000, // Increased default to 30 seconds for better reliability
  retries: number = 2 // Add retry mechanism
): Promise<{ data: T | null; error: any }> => {
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startTime = Date.now();
    const isRetry = attempt > 0;

    try {
      debugLog(`🔍 Starting query ${isRetry ? `(retry ${attempt}/${retries})` : ''} with timeout: ${timeout}ms`);

      // Create a more aggressive timeout mechanism
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          debugLog(`⏰ Query timeout triggered after ${timeout}ms`);
          reject(new Error('Query timeout'));
        }, timeout);
      });

      try {
        const result = await Promise.race([query, timeoutPromise]);
        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;

        if (result?.error) {
          debugLog(`❌ Query failed (${duration}ms):`, result.error);
          debugLog(`❌ Error details:`, {
            message: result.error.message,
            code: result.error.code,
            details: result.error.details,
            hint: result.error.hint
          });

          // If it's a network error and we have retries left, continue to retry
          if (attempt < retries && (result.error.message?.includes('network') || result.error.message?.includes('timeout'))) {
            lastError = result.error;
            debugLog(`🔄 Network error detected, retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }

          return result;
        } else {
          debugLog(`✅ Query successful (${duration}ms), data length:`, Array.isArray(result?.data) ? result.data.length : 'not array');
          return result || { data: null, error: new Error('No result returned') };
        }
      } catch (raceError) {
        clearTimeout(timeoutId);
        throw raceError;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      lastError = error;

      if (error.message === 'Query timeout') {
        debugLog(`⏰ Query timed out after ${duration}ms`);

        // Retry on timeout if we have retries left
        if (attempt < retries) {
          debugLog(`🔄 Timeout detected, retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }

        return { data: null, error: new Error(`Query timeout after ${timeout}ms (${retries + 1} attempts)`) };
      } else {
        debugLog(`💥 Query failed (${duration}ms):`, error);
        debugLog(`💥 Error details:`, {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          stack: error.stack
        });

        // Retry on network errors
        if (attempt < retries && (error.message?.includes('network') || error.message?.includes('fetch'))) {
          debugLog(`🔄 Network error detected, retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        return { data: null, error };
      }
    }
  }

  // If we get here, all retries failed
  return { data: null, error: lastError || new Error('All retry attempts failed') };
};
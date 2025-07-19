/**
 * Supabase Authentication Test Utility
 * Tests the Supabase client configuration and authentication
 */

import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from '@/config/env';

// Test Supabase client configuration
export const testSupabaseConfig = () => {
  console.log('🧪 Testing Supabase Configuration...');
  
  console.log('Environment Variables:');
  console.log('- SUPABASE_URL:', SUPABASE_CONFIG.url);
  console.log('- ANON_KEY (first 20 chars):', SUPABASE_CONFIG.anonKey.substring(0, 20) + '...');
  console.log('- ANON_KEY length:', SUPABASE_CONFIG.anonKey.length);
  
  // Test if client is properly initialized
  console.log('Supabase client:', supabase);
  console.log('Supabase client auth:', supabase.auth);
  
  return {
    url: SUPABASE_CONFIG.url,
    anonKeyLength: SUPABASE_CONFIG.anonKey.length,
    clientInitialized: !!supabase,
    authInitialized: !!supabase.auth
  };
};

// Test anonymous access to trainers table
export const testAnonymousAccess = async () => {
  console.log('🧪 Testing Anonymous Access to Trainers Table...');
  
  try {
    // Test simple count query
    const { data: countData, error: countError } = await supabase
      .from('trainers')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count query failed:', countError);
      return { success: false, error: countError.message, type: 'count' };
    }

    console.log('✅ Count query successful');

    // Test actual data query
    const { data: trainersData, error: trainersError } = await supabase
      .from('trainers')
      .select('id, name, contact_email')
      .limit(1);

    if (trainersError) {
      console.error('❌ Data query failed:', trainersError);
      return { success: false, error: trainersError.message, type: 'data' };
    }

    console.log('✅ Data query successful:', trainersData);
    return { success: true, data: trainersData };

  } catch (error) {
    console.error('💥 Anonymous access test failed:', error);
    return { success: false, error: error.message, type: 'exception' };
  }
};

// Test authentication status
export const testAuthStatus = async () => {
  console.log('🧪 Testing Authentication Status...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth status check failed:', error);
      return { success: false, error: error.message };
    }

    console.log('Auth session:', session);
    
    return {
      success: true,
      hasSession: !!session,
      user: session?.user || null,
      role: session?.user?.role || 'anon'
    };

  } catch (error) {
    console.error('💥 Auth status test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test RLS policies
export const testRLSPolicies = async () => {
  console.log('🧪 Testing RLS Policies...');
  
  try {
    // Test with explicit anon role
    const { data, error } = await supabase
      .from('trainers')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ RLS policy test failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ RLS policy test successful');
    return { success: true, data };

  } catch (error) {
    console.error('💥 RLS policy test failed:', error);
    return { success: false, error: error.message };
  }
};

// Run comprehensive Supabase tests
export const runSupabaseTests = async () => {
  console.log('🚀 Starting Comprehensive Supabase Tests...');
  
  const results = {
    config: testSupabaseConfig(),
    auth: await testAuthStatus(),
    rls: await testRLSPolicies(),
    anonymous: await testAnonymousAccess(),
  };

  const allTestsPassed = results.auth.success && results.rls.success && results.anonymous.success;

  console.log('📋 Supabase Test Results Summary:');
  console.log('- Config:', results.config.clientInitialized ? '✅ PASS' : '❌ FAIL');
  console.log('- Auth Status:', results.auth.success ? '✅ PASS' : '❌ FAIL');
  console.log('- RLS Policies:', results.rls.success ? '✅ PASS' : '❌ FAIL');
  console.log('- Anonymous Access:', results.anonymous.success ? '✅ PASS' : '❌ FAIL');
  console.log('Overall:', allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

  return {
    success: allTestsPassed,
    results
  };
};

// Test with direct fetch to bypass Supabase client
export const testDirectFetch = async () => {
  console.log('🧪 Testing Direct Fetch to Supabase API...');
  
  try {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/trainers?select=id,name&limit=1`;
    const headers = {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json',
    };

    console.log('Fetch URL:', url);
    console.log('Headers:', headers);

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Direct fetch failed:', response.status, errorText);
      return { success: false, status: response.status, error: errorText };
    }

    const data = await response.json();
    console.log('✅ Direct fetch successful:', data);
    return { success: true, data };

  } catch (error) {
    console.error('💥 Direct fetch test failed:', error);
    return { success: false, error: error.message };
  }
};

// Export for use in components or debugging
export default {
  testSupabaseConfig,
  testAnonymousAccess,
  testAuthStatus,
  testRLSPolicies,
  testDirectFetch,
  runSupabaseTests
};

/**
 * Utility to test Supabase connection and RPC functions
 * This helps debug timeout and connection issues
 */

import { supabase, callRPCWithTimeout, queryWithTimeout } from '@/integrations/supabase/client';

export interface ConnectionTestResult {
  test: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

export const testSupabaseConnection = async (): Promise<ConnectionTestResult[]> => {
  const results: ConnectionTestResult[] = [];

  // Test 1: Basic connection
  const basicTest = await runTest('Basic Connection', async () => {
    const { data, error } = await queryWithTimeout(
      supabase.from('users').select('count').limit(1),
      5000
    );
    if (error) throw error;
    return data;
  });
  results.push(basicTest);

  // Test 2: Trainers table query
  const trainersTest = await runTest('Trainers Table Query', async () => {
    const { data, error } = await queryWithTimeout(
      supabase.from('trainers').select('id, name').limit(5),
      8000
    );
    if (error) throw error;
    return data;
  });
  results.push(trainersTest);

  // Test 3: Enhanced RPC function
  const rpcTest = await runTest('Enhanced RPC Function', async () => {
    const { data, error } = await callRPCWithTimeout(
      'search_trainers_enhanced',
      {
        search_query: '',
        specialty_filter: '',
        gym_id_filter: null,
        min_rating: 0,
        limit_count: 5,
        offset_count: 0
      },
      {
        timeout: 12000,
        retries: 1
      }
    );
    if (error) throw error;
    return data;
  });
  results.push(rpcTest);

  // Test 4: Gyms table query
  const gymsTest = await runTest('Gyms Table Query', async () => {
    const { data, error } = await queryWithTimeout(
      supabase.from('gyms').select('id, name').limit(5),
      8000
    );
    if (error) throw error;
    return data;
  });
  results.push(gymsTest);

  return results;
};

async function runTest(
  testName: string,
  testFunction: () => Promise<any>
): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  
  try {
    const data = await testFunction();
    const duration = Date.now() - startTime;
    
    return {
      test: testName,
      success: true,
      duration,
      data
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    return {
      test: testName,
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to log test results
export const logTestResults = (results: ConnectionTestResult[]) => {
  console.group('🔍 Supabase Connection Test Results');
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    
    console.group(`${icon} Test ${index + 1}: ${result.test} (${duration})`);
    
    if (result.success) {
      console.log('✅ Success');
      if (result.data) {
        console.log('📊 Data:', result.data);
      }
    } else {
      console.error('❌ Error:', result.error);
    }
    
    console.groupEnd();
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n📈 Summary: ${successCount}/${totalCount} tests passed`);
  console.groupEnd();
};

// Quick test function for debugging
export const quickConnectionTest = async () => {
  console.log('🚀 Running quick Supabase connection test...');
  
  try {
    const results = await testSupabaseConnection();
    logTestResults(results);
    return results;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    throw error;
  }
};

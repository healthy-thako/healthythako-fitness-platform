#!/usr/bin/env node

/**
 * Payment Integration Validation Script
 * Tests all payment flows and validates the integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  supabaseUrl: 'https://lhncpcsniuxnrmabbkmr.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzI4NzQsImV4cCI6MjA2NjU0ODg3NH0.Hs6IQZS8Hs6IQZS8Hs6IQZS8Hs6IQZS8Hs6IQZS8Hs6IQZS8',
  testPayments: [
    {
      type: 'trainer_booking',
      amount: 1500,
      description: 'Test trainer booking payment'
    },
    {
      type: 'gym_membership',
      amount: 2000,
      description: 'Test gym membership payment'
    },
    {
      type: 'service_order',
      amount: 800,
      description: 'Test service order payment'
    }
  ]
};

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': TEST_CONFIG.anonKey,
        'Authorization': `Bearer ${TEST_CONFIG.anonKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.log('❌ Supabase connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function testEdgeFunction(functionName) {
  console.log(`🔧 Testing Edge Function: ${functionName}...`);
  
  try {
    const response = await fetch(`${TEST_CONFIG.supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.anonKey}`
      },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success !== false) {
      console.log(`✅ ${functionName} function working`);
      return { success: true, result };
    } else {
      console.log(`❌ ${functionName} function failed:`, result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ ${functionName} function error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testPaymentCreation(paymentData) {
  console.log(`💳 Testing payment creation: ${paymentData.type}...`);
  
  try {
    const response = await fetch(`${TEST_CONFIG.supabaseUrl}/functions/v1/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.anonKey}`
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: 'BDT',
        customer_name: 'Test User',
        customer_email: 'test@healthythako.com',
        return_url: 'https://healthythako.com/payment-success',
        cancel_url: 'https://healthythako.com/payment-cancelled',
        metadata: {
          test: true,
          payment_type: paymentData.type,
          user_id: 'test-user-id'
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success && result.payment_url) {
      console.log(`✅ ${paymentData.type} payment creation successful`);
      console.log(`   Payment URL: ${result.payment_url}`);
      return { success: true, paymentUrl: result.payment_url };
    } else {
      console.log(`❌ ${paymentData.type} payment creation failed:`, result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ ${paymentData.type} payment creation error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testEnvironmentSetup() {
  console.log('⚙️ Testing environment setup...');
  
  const envTest = await testEdgeFunction('setup-environment');
  
  if (envTest.success) {
    const env = envTest.result.environment;
    const apiTest = envTest.result.apiTest;
    
    console.log('📊 Environment Status:');
    console.log(`   UDDOKTAPAY_API_KEY: ${env?.variables?.UDDOKTAPAY_API_KEY?.isSet ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SUPABASE_URL: ${env?.variables?.SUPABASE_URL?.isSet ? '✅ Set' : '❌ Missing'}`);
    console.log(`   API Test: ${apiTest?.success ? '✅ Passed' : '❌ Failed'}`);
    
    return env?.variables?.UDDOKTAPAY_API_KEY?.isSet && apiTest?.success;
  }
  
  return false;
}

async function validateDatabaseSchema() {
  console.log('🗄️ Validating database schema...');
  
  const requiredTables = [
    'users',
    'trainers', 
    'gyms',
    'trainer_bookings',
    'user_memberships',
    'membership_plans',
    'transactions',
    'reviews'
  ];
  
  let allTablesExist = true;
  
  for (const table of requiredTables) {
    try {
      const response = await fetch(`${TEST_CONFIG.supabaseUrl}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': TEST_CONFIG.anonKey,
          'Authorization': `Bearer ${TEST_CONFIG.anonKey}`
        }
      });
      
      if (response.ok) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing or inaccessible`);
        allTablesExist = false;
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
      allTablesExist = false;
    }
  }
  
  return allTablesExist;
}

async function generateTestReport(results) {
  const reportPath = path.join(path.dirname(__dirname), 'payment-integration-report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length
    },
    results,
    recommendations: []
  };
  
  // Add recommendations based on results
  if (!results.supabaseConnection.success) {
    report.recommendations.push('Fix Supabase connection configuration');
  }
  
  if (!results.environmentSetup.success) {
    report.recommendations.push('Set required environment variables in Supabase');
  }
  
  if (!results.databaseSchema.success) {
    report.recommendations.push('Verify database schema and RLS policies');
  }
  
  const failedPayments = Object.entries(results.payments || {})
    .filter(([_, result]) => !result.success)
    .map(([type, _]) => type);
  
  if (failedPayments.length > 0) {
    report.recommendations.push(`Fix payment creation for: ${failedPayments.join(', ')}`);
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Test report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  console.log('🧪 HealthyThako Payment Integration Validation\\n');
  
  const results = {};
  
  // Test 1: Supabase Connection
  results.supabaseConnection = {
    success: await testSupabaseConnection()
  };
  
  // Test 2: Database Schema
  results.databaseSchema = {
    success: await validateDatabaseSchema()
  };
  
  // Test 3: Environment Setup
  results.environmentSetup = {
    success: await testEnvironmentSetup()
  };
  
  // Test 4: Edge Functions
  results.edgeFunctions = {};
  const functions = ['create-payment', 'verify-payment', 'setup-environment'];
  
  for (const func of functions) {
    results.edgeFunctions[func] = await testEdgeFunction(func);
  }
  
  // Test 5: Payment Creation (only if environment is set up)
  if (results.environmentSetup.success) {
    results.payments = {};
    
    for (const payment of TEST_CONFIG.testPayments) {
      results.payments[payment.type] = await testPaymentCreation(payment);
    }
  } else {
    console.log('⚠️ Skipping payment tests - environment not properly configured');
  }
  
  // Generate report
  const report = await generateTestReport(results);
  
  // Summary
  console.log('\\n📊 Validation Summary:');
  console.log(`✅ Passed: ${report.summary.passed}/${report.summary.totalTests} tests`);
  console.log(`❌ Failed: ${report.summary.failed}/${report.summary.totalTests} tests`);
  
  if (report.recommendations.length > 0) {
    console.log('\\n🔧 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
  
  if (report.summary.failed === 0) {
    console.log('\\n🎉 All tests passed! Payment integration is ready for production.');
  } else {
    console.log('\\n⚠️ Some tests failed. Please address the issues above before deploying to production.');
  }
}

// Run validation
main().catch(console.error);

export {
  testSupabaseConnection,
  testEdgeFunction,
  testPaymentCreation,
  validateDatabaseSchema
};

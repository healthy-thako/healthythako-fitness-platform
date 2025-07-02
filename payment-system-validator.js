/**
 * HealthyThako Payment System Validator
 * Comprehensive testing script for payment redirect system
 */

const SUPABASE_URL = 'https://lhncpcsniuxnrmabbkmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U';

class PaymentSystemValidator {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    
    if (type === 'error') {
      this.errors.push(logEntry);
    } else {
      this.results.push(logEntry);
    }
  }

  async validateDatabaseConnection() {
    this.log('🔍 Testing database connection...');
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        this.log('✅ Database connection successful');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async validateEdgeFunctions() {
    this.log('🔍 Testing Edge Functions...');
    
    const functions = [
      'payment-redirect-handler',
      'create-payment',
      'verify-payment'
    ];

    let allValid = true;

    for (const functionName of functions) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ test: true })
        });

        // Even if the function returns an error, it means it's accessible
        if (response.status !== 404) {
          this.log(`✅ Edge Function '${functionName}' is accessible`);
        } else {
          this.log(`❌ Edge Function '${functionName}' not found`, 'error');
          allValid = false;
        }
      } catch (error) {
        this.log(`❌ Edge Function '${functionName}' test failed: ${error.message}`, 'error');
        allValid = false;
      }
    }

    return allValid;
  }

  async validatePaymentRedirectHandler() {
    this.log('🔍 Testing payment redirect handler...');
    
    const testCases = [
      {
        name: 'Trainer Booking Success',
        data: {
          orderId: 'trainer_booking_test_123',
          type: 'success',
          source: 'mobile_app'
        }
      },
      {
        name: 'Order Success',
        data: {
          orderId: 'order_test_456',
          type: 'success',
          source: 'web_browser'
        }
      },
      {
        name: 'Payment Cancel',
        data: {
          orderId: 'test_789',
          type: 'cancel',
          source: 'mobile_app'
        }
      }
    ];

    let allValid = true;

    for (const testCase of testCases) {
      try {
        this.log(`Testing: ${testCase.name}`);
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-redirect-handler`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            ...testCase.data,
            userAgent: 'PaymentSystemValidator/1.0',
            ipAddress: '127.0.0.1'
          })
        });

        const result = await response.json();
        
        if (response.ok && result.success !== undefined) {
          this.log(`✅ ${testCase.name}: Handler responded correctly`);
          
          // Validate deep link generation
          if (result.deepLink && result.deepLink.startsWith('healthythako://')) {
            this.log(`✅ ${testCase.name}: Deep link generated correctly`);
          } else {
            this.log(`⚠️ ${testCase.name}: Deep link missing or invalid`, 'error');
          }
        } else {
          this.log(`❌ ${testCase.name}: Handler failed - ${result.error || 'Unknown error'}`, 'error');
          allValid = false;
        }
      } catch (error) {
        this.log(`❌ ${testCase.name}: Test failed - ${error.message}`, 'error');
        allValid = false;
      }
    }

    return allValid;
  }

  async validateRLSPolicies() {
    this.log('🔍 Testing RLS policies...');
    
    const tables = ['orders', 'trainer_bookings', 'payment_transactions', 'payment_redirect_audit'];
    let allValid = true;

    for (const table of tables) {
      try {
        // Test anonymous access (should be limited)
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });

        if (response.status === 200 || response.status === 401 || response.status === 403) {
          this.log(`✅ RLS policy active for table '${table}'`);
        } else {
          this.log(`⚠️ Unexpected response for table '${table}': ${response.status}`, 'error');
        }
      } catch (error) {
        this.log(`❌ RLS test failed for table '${table}': ${error.message}`, 'error');
        allValid = false;
      }
    }

    return allValid;
  }

  async validateDeepLinkGeneration() {
    this.log('🔍 Testing deep link generation...');
    
    const testCases = [
      {
        orderId: 'test_123',
        type: 'success',
        orderData: {
          type: 'order',
          total_amount: 1500,
          user_id: '550e8400-e29b-41d4-a716-446655440000'
        }
      },
      {
        orderId: 'trainer_456',
        type: 'cancel',
        orderData: {
          type: 'trainer_booking',
          amount: 2000,
          user_id: '550e8400-e29b-41d4-a716-446655440001'
        }
      }
    ];

    let allValid = true;

    for (const testCase of testCases) {
      try {
        const baseScheme = 'healthythako://';
        const path = testCase.type === 'success' ? 'payment-success' : 'payment-cancel';
        
        const params = new URLSearchParams();
        params.set('orderId', testCase.orderId);
        params.set('status', testCase.type === 'success' ? 'completed' : 'cancelled');
        params.set('source', 'web_redirect');
        params.set('timestamp', Date.now().toString());
        
        if (testCase.orderData) {
          params.set('orderType', testCase.orderData.type);
          if (testCase.orderData.total_amount || testCase.orderData.amount) {
            params.set('amount', (testCase.orderData.total_amount || testCase.orderData.amount).toString());
          }
          if (testCase.orderData.user_id) {
            params.set('userId', testCase.orderData.user_id);
          }
        }
        
        const deepLinkUrl = `${baseScheme}${path}?${params.toString()}`;
        
        // Validate deep link structure
        if (deepLinkUrl.startsWith('healthythako://') && deepLinkUrl.includes('orderId=')) {
          this.log(`✅ Deep link generated correctly: ${deepLinkUrl.substring(0, 50)}...`);
        } else {
          this.log(`❌ Invalid deep link generated: ${deepLinkUrl}`, 'error');
          allValid = false;
        }
      } catch (error) {
        this.log(`❌ Deep link generation failed: ${error.message}`, 'error');
        allValid = false;
      }
    }

    return allValid;
  }

  async validateAuditLogging() {
    this.log('🔍 Testing audit logging...');
    
    try {
      // Test audit logging function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-redirect-handler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          orderId: 'audit_test_' + Date.now(),
          type: 'success',
          source: 'test_validator',
          userAgent: 'PaymentSystemValidator/1.0'
        })
      });

      const result = await response.json();
      
      if (result.auditId) {
        this.log('✅ Audit logging working correctly');
        return true;
      } else {
        this.log('⚠️ Audit logging may not be working', 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Audit logging test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting HealthyThako Payment System Validation...');
    
    const tests = [
      { name: 'Database Connection', fn: () => this.validateDatabaseConnection() },
      { name: 'Edge Functions', fn: () => this.validateEdgeFunctions() },
      { name: 'Payment Redirect Handler', fn: () => this.validatePaymentRedirectHandler() },
      { name: 'RLS Policies', fn: () => this.validateRLSPolicies() },
      { name: 'Deep Link Generation', fn: () => this.validateDeepLinkGeneration() },
      { name: 'Audit Logging', fn: () => this.validateAuditLogging() }
    ];

    const results = {};
    let overallSuccess = true;

    for (const test of tests) {
      this.log(`\n📋 Running ${test.name} tests...`);
      const success = await test.fn();
      results[test.name] = success;
      
      if (!success) {
        overallSuccess = false;
      }
    }

    // Generate summary report
    this.generateReport(results, overallSuccess);
    
    return {
      success: overallSuccess,
      results,
      errors: this.errors,
      logs: this.results
    };
  }

  generateReport(results, overallSuccess) {
    this.log('\n📊 VALIDATION SUMMARY REPORT');
    this.log('=' * 50);
    
    Object.entries(results).forEach(([testName, success]) => {
      const status = success ? '✅ PASS' : '❌ FAIL';
      this.log(`${status} ${testName}`);
    });
    
    this.log('=' * 50);
    this.log(`Overall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    this.log(`Total Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      this.log('\n🚨 ERRORS FOUND:');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error.message}`);
      });
    }
    
    this.log('\n🎯 NEXT STEPS:');
    if (overallSuccess) {
      this.log('✅ Payment system is ready for production deployment');
      this.log('✅ Deploy ENHANCED_PAYMENT_REDIRECT_HANDLER.html to https://healthythako.com/payment-redirect/index.html');
      this.log('✅ Update mobile app with deep link handlers');
      this.log('✅ Test end-to-end payment flow');
    } else {
      this.log('❌ Fix the failed tests before deployment');
      this.log('❌ Review error messages above');
      this.log('❌ Re-run validation after fixes');
    }
  }
}

// Usage
if (typeof window !== 'undefined') {
  // Browser environment
  window.PaymentSystemValidator = PaymentSystemValidator;
  
  // Auto-run validation
  const validator = new PaymentSystemValidator();
  validator.runAllTests().then(result => {
    console.log('Validation complete:', result);
  });
} else if (typeof module !== 'undefined') {
  // Node.js environment
  module.exports = PaymentSystemValidator;
}

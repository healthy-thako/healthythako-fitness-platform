#!/usr/bin/env node

/**
 * Payment Redirect Testing Script for HealthyThako
 * Tests payment redirection flow in both development and production environments
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 HealthyThako Payment Redirect Testing');
console.log('========================================\n');

function checkEnvironmentConfiguration() {
  console.log('🔍 Checking Environment Configuration...');
  
  const envPath = path.join(__dirname, '..', '.env');
  const productionEnvPath = path.join(__dirname, '..', '.env.production');
  
  const results = {
    development: { exists: false, valid: false, issues: [] },
    production: { exists: false, valid: false, issues: [] }
  };
  
  // Check development environment
  if (fs.existsSync(envPath)) {
    results.development.exists = true;
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check for required variables
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_UDDOKTAPAY_API_KEY',
      'VITE_APP_URL'
    ];
    
    requiredVars.forEach(varName => {
      if (!envContent.includes(`${varName}=`)) {
        results.development.issues.push(`Missing ${varName}`);
      }
    });
    
    // Check URL configuration
    if (envContent.includes('VITE_APP_URL=http://localhost:8080')) {
      console.log('✅ Development environment uses localhost (correct)');
    } else {
      results.development.issues.push('Development should use localhost URL');
    }
    
    results.development.valid = results.development.issues.length === 0;
  }
  
  // Check production environment
  if (fs.existsSync(productionEnvPath)) {
    results.production.exists = true;
    const envContent = fs.readFileSync(productionEnvPath, 'utf8');
    
    // Check for production URL
    if (envContent.includes('VITE_APP_URL=https://healthythako.com')) {
      console.log('✅ Production environment uses healthythako.com (correct)');
    } else {
      results.production.issues.push('Production should use https://healthythako.com');
    }
    
    // Check debug logs are disabled
    if (envContent.includes('VITE_ENABLE_DEBUG_LOGS=false')) {
      console.log('✅ Debug logs disabled in production (correct)');
    } else {
      results.production.issues.push('Debug logs should be disabled in production');
    }
    
    results.production.valid = results.production.issues.length === 0;
  }
  
  return results;
}

function generateTestURLs() {
  console.log('\n🔗 Generating Test URLs...');
  
  const testScenarios = [
    {
      name: 'Development - Trainer Booking',
      environment: 'development',
      baseUrl: 'http://localhost:8080',
      redirectUrl: 'http://localhost:8080/payment-redirect?type=trainer_booking',
      successUrl: 'http://localhost:8080/payment-success?type=trainer_booking',
      cancelUrl: 'http://localhost:8080/payment-cancelled?type=trainer_booking'
    },
    {
      name: 'Production - Trainer Booking',
      environment: 'production',
      baseUrl: 'https://healthythako.com',
      redirectUrl: 'https://healthythako.com/payment-redirect?type=trainer_booking',
      successUrl: 'https://healthythako.com/payment-success?type=trainer_booking',
      cancelUrl: 'https://healthythako.com/payment-cancelled?type=trainer_booking'
    },
    {
      name: 'Mobile App - Trainer Booking',
      environment: 'mobile',
      baseUrl: 'healthythako://',
      redirectUrl: 'healthythako://payment/success?type=trainer_booking',
      successUrl: 'healthythako://payment/success?type=trainer_booking',
      cancelUrl: 'healthythako://payment/cancelled?type=trainer_booking'
    }
  ];
  
  testScenarios.forEach(scenario => {
    console.log(`\n📱 ${scenario.name}:`);
    console.log(`   Redirect: ${scenario.redirectUrl}`);
    console.log(`   Success:  ${scenario.successUrl}`);
    console.log(`   Cancel:   ${scenario.cancelUrl}`);
  });
  
  return testScenarios;
}

function generateTestChecklist() {
  console.log('\n📋 Manual Testing Checklist:');
  console.log('============================\n');
  
  const checklist = [
    '🌐 Web Browser Testing:',
    '  □ Open http://localhost:8080 in development',
    '  □ Navigate to trainer booking page',
    '  □ Initiate payment flow',
    '  □ Verify redirect to UddoktaPay gateway',
    '  □ Complete test payment',
    '  □ Verify redirect back to /payment-redirect',
    '  □ Verify final redirect to /payment-success',
    '',
    '🏭 Production Testing:',
    '  □ Deploy to https://healthythako.com',
    '  □ Test same flow as development',
    '  □ Verify all URLs use healthythako.com domain',
    '  □ Check that debug logs are not visible',
    '  □ Test gym membership payment flow',
    '  □ Test service order payment flow',
    '',
    '📱 Mobile App Testing:',
    '  □ Open app in mobile device/simulator',
    '  □ Initiate payment from within app',
    '  □ Verify payment opens in WebView or browser',
    '  □ Complete payment',
    '  □ Verify deep link redirect back to app',
    '  □ Check payment success is handled in app',
    '',
    '🔧 Edge Function Testing:',
    '  □ Check Supabase Edge Functions are deployed',
    '  □ Verify create-payment function works',
    '  □ Verify verify-payment function works',
    '  □ Test webhook functionality',
    '  □ Check function logs for errors',
    '',
    '🔐 Security Testing:',
    '  □ Verify API keys are not exposed in client',
    '  □ Test payment verification is secure',
    '  □ Check RLS policies are working',
    '  □ Verify webhook signature validation'
  ];
  
  checklist.forEach(item => console.log(item));
}

function showDeploymentSteps() {
  console.log('\n🚀 Deployment Steps for Production:');
  console.log('===================================\n');
  
  console.log('1. 📋 Prepare Environment:');
  console.log('   node scripts/deploy-to-production.js --setup\n');
  
  console.log('2. 🏗️  Build Application:');
  console.log('   npm run build\n');
  
  console.log('3. 🌐 Deploy to Hosting:');
  console.log('   # For Vercel:');
  console.log('   vercel --prod');
  console.log('   # For Netlify:');
  console.log('   netlify deploy --prod\n');
  
  console.log('4. 🔧 Configure Supabase:');
  console.log('   # Set environment variables in Supabase Dashboard');
  console.log('   # Deploy Edge Functions:');
  console.log('   supabase functions deploy --project-ref lhncpcsniuxnrmabbkmr\n');
  
  console.log('5. 🧪 Test Deployment:');
  console.log('   node scripts/test-payment-redirect.js --validate\n');
}

function validateCurrentSetup() {
  console.log('🔍 Validating Current Setup...\n');
  
  const envConfig = checkEnvironmentConfiguration();
  const testUrls = generateTestURLs();
  
  let allValid = true;
  
  // Check development environment
  if (!envConfig.development.exists) {
    console.log('❌ Development .env file missing');
    allValid = false;
  } else if (!envConfig.development.valid) {
    console.log('❌ Development environment has issues:');
    envConfig.development.issues.forEach(issue => console.log(`   - ${issue}`));
    allValid = false;
  } else {
    console.log('✅ Development environment configured correctly');
  }
  
  // Check production environment
  if (!envConfig.production.exists) {
    console.log('❌ Production .env.production file missing');
    allValid = false;
  } else if (!envConfig.production.valid) {
    console.log('❌ Production environment has issues:');
    envConfig.production.issues.forEach(issue => console.log(`   - ${issue}`));
    allValid = false;
  } else {
    console.log('✅ Production environment configured correctly');
  }
  
  if (allValid) {
    console.log('\n🎉 All configurations look good!');
    console.log('Ready for testing and deployment.');
  } else {
    console.log('\n⚠️  Please fix the issues above before proceeding.');
  }
  
  return allValid;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node scripts/test-payment-redirect.js [options]');
    console.log('Options:');
    console.log('  --validate    Validate current configuration');
    console.log('  --checklist   Show manual testing checklist');
    console.log('  --deploy      Show deployment steps');
    console.log('  --help        Show this help message');
    return;
  }
  
  if (args.includes('--validate')) {
    validateCurrentSetup();
    return;
  }
  
  if (args.includes('--checklist')) {
    generateTestChecklist();
    return;
  }
  
  if (args.includes('--deploy')) {
    showDeploymentSteps();
    return;
  }
  
  // Default: show everything
  validateCurrentSetup();
  generateTestURLs();
  generateTestChecklist();
  showDeploymentSteps();
}

main();

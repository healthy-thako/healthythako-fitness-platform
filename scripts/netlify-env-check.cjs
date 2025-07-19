#!/usr/bin/env node

/**
 * Netlify Environment Variables Checker
 * This script helps verify that all required environment variables are properly set
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 HealthyThako Netlify Environment Check');
console.log('==========================================\n');

// Required environment variables for production
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_UDDOKTAPAY_API_KEY',
  'VITE_UDDOKTAPAY_BASE_URL',
  'VITE_UDDOKTAPAY_ENVIRONMENT',
  'VITE_APP_NAME',
  'VITE_APP_URL',
  'VITE_APP_ENVIRONMENT',
  'VITE_PAYMENT_CURRENCY',
  'VITE_PAYMENT_SUCCESS_URL',
  'VITE_PAYMENT_CANCEL_URL',
  'VITE_PAYMENT_REDIRECT_URL',
];

// Production values that should be set
const PRODUCTION_VALUES = {
  'VITE_SUPABASE_URL': 'https://lhncpcsniuxnrmabbkmr.supabase.co',
  'VITE_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
  'VITE_UDDOKTAPAY_API_KEY': 'yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU',
  'VITE_UDDOKTAPAY_BASE_URL': 'https://digitaldot.paymently.io/api',
  'VITE_UDDOKTAPAY_ENVIRONMENT': 'production',
  'VITE_APP_NAME': 'HealthyThako',
  'VITE_APP_URL': 'https://healthythako.com',
  'VITE_APP_ENVIRONMENT': 'production',
  'VITE_PAYMENT_CURRENCY': 'BDT',
  'VITE_PAYMENT_SUCCESS_URL': '/payment-success',
  'VITE_PAYMENT_CANCEL_URL': '/payment-cancelled',
  'VITE_PAYMENT_REDIRECT_URL': '/payment-redirect',
  'VITE_ENABLE_DEBUG_LOGS': 'false',
  'VITE_ENABLE_REAL_TIME': 'true',
  'VITE_ENABLE_NOTIFICATIONS': 'true',
  'VITE_ENABLE_ANALYTICS': 'true',
};

function checkLocalEnvFile() {
  console.log('📋 Checking local .env.production file...\n');
  
  const envPath = path.join(__dirname, '..', '.env.production');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.production file not found!');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  let allPresent = true;
  
  REQUIRED_ENV_VARS.forEach(varName => {
    const found = envLines.some(line => line.startsWith(`${varName}=`));
    if (found) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - MISSING`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

function generateNetlifyEnvCommands() {
  console.log('\n🌐 Netlify Environment Variables Setup');
  console.log('=====================================\n');
  
  console.log('Go to your Netlify dashboard:');
  console.log('1. Open your site dashboard');
  console.log('2. Go to Site settings > Environment variables');
  console.log('3. Add the following variables:\n');
  
  Object.entries(PRODUCTION_VALUES).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n📝 Or use Netlify CLI:');
  console.log('netlify env:set VARIABLE_NAME "value"\n');
}

function generateBuildCommands() {
  console.log('\n🏗️  Build Commands for Netlify');
  console.log('=============================\n');
  
  console.log('1. Local build test:');
  console.log('   npm run build\n');
  
  console.log('2. Netlify build settings:');
  console.log('   - Build command: npm run build');
  console.log('   - Publish directory: dist');
  console.log('   - Node version: 18\n');
  
  console.log('3. Deploy:');
  console.log('   netlify deploy --prod --dir=dist\n');
}

function checkNetlifyConfig() {
  console.log('\n📋 Checking netlify.toml configuration...\n');
  
  const netlifyPath = path.join(__dirname, '..', 'netlify.toml');
  
  if (!fs.existsSync(netlifyPath)) {
    console.log('❌ netlify.toml not found!');
    return false;
  }
  
  const content = fs.readFileSync(netlifyPath, 'utf8');
  
  const checks = [
    { name: 'Publish directory', check: content.includes('publish = "dist"') },
    { name: 'Build command', check: content.includes('command = "npm run build"') },
    { name: 'SPA redirects', check: content.includes('to = "/index.html"') },
    { name: 'API redirects', check: content.includes('lhncpcsniuxnrmabbkmr.supabase.co') },
    { name: 'MIME types', check: content.includes('Content-Type = "text/javascript"') },
  ];
  
  let allGood = true;
  checks.forEach(({ name, check }) => {
    if (check) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name} - MISSING`);
      allGood = false;
    }
  });
  
  return allGood;
}

function generateTroubleshootingSteps() {
  console.log('\n🔧 Troubleshooting Steps');
  console.log('========================\n');
  
  console.log('If data fetching still fails after setting env vars:');
  console.log('1. Check browser console for errors');
  console.log('2. Verify network requests in DevTools');
  console.log('3. Test API endpoints directly');
  console.log('4. Check CORS settings in Supabase dashboard');
  console.log('5. Verify RLS policies are not blocking requests\n');
  
  console.log('Common issues:');
  console.log('- Environment variables not set in Netlify');
  console.log('- CORS issues with Supabase');
  console.log('- Build process not including env vars');
  console.log('- Network/DNS issues');
  console.log('- RLS policies blocking anonymous access\n');
}

// Run all checks
function main() {
  const envCheck = checkLocalEnvFile();
  const configCheck = checkNetlifyConfig();
  
  generateNetlifyEnvCommands();
  generateBuildCommands();
  generateTroubleshootingSteps();
  
  if (envCheck && configCheck) {
    console.log('✅ All checks passed! Your configuration looks good.');
  } else {
    console.log('❌ Some issues found. Please fix them before deploying.');
  }
}

main();

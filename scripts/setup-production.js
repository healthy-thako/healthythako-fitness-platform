#!/usr/bin/env node

/**
 * Production Setup Script for HealthyThako
 * Configures environment for production deployment to healthythako.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 HealthyThako Production Setup');
console.log('================================\n');

function backupCurrentEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const backupPath = path.join(__dirname, '..', '.env.development.backup');
  
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, backupPath);
    console.log('✅ Backed up current .env to .env.development.backup');
    return true;
  }
  return false;
}

function createProductionEnv() {
  console.log('📝 Creating production environment configuration...');
  
  const productionEnv = `# HealthyThako Production Environment Configuration
# Generated for healthythako.com deployment

# Client-side Environment Variables (VITE_ prefixed)
VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U
VITE_UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
VITE_UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api
VITE_UDDOKTAPAY_ENVIRONMENT=production

# Application Configuration - PRODUCTION SETTINGS
VITE_APP_NAME=HealthyThako
VITE_APP_URL=https://healthythako.com
VITE_APP_ENVIRONMENT=production

# Payment Configuration
VITE_PAYMENT_CURRENCY=BDT
VITE_PAYMENT_SUCCESS_URL=/payment-success
VITE_PAYMENT_CANCEL_URL=/payment-cancelled
VITE_PAYMENT_REDIRECT_URL=/payment-redirect
VITE_PLATFORM_COMMISSION=0.1
VITE_DEFAULT_TRAINER_RATE=1200
VITE_DEFAULT_GYM_MONTHLY_RATE=2000

# Feature Flags (Production Settings)
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_LOGS=false

# Mobile App Configuration
VITE_MOBILE_APP_SCHEME=healthythako
VITE_MOBILE_DEEP_LINK_SUCCESS=healthythako://payment/success
VITE_MOBILE_DEEP_LINK_CANCEL=healthythako://payment/cancelled

# Contact Information
VITE_SUPPORT_EMAIL=support@healthythako.com
VITE_CONTACT_EMAIL=contact@healthythako.com

# API Configuration
VITE_API_RATE_LIMIT=100
VITE_API_RATE_WINDOW=60000
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf

# Server-side Environment Variables (for Edge Functions)
UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, productionEnv);
  
  console.log('✅ Created production .env configuration');
  console.log('🔧 Key changes made:');
  console.log('   - VITE_APP_URL: https://healthythako.com');
  console.log('   - VITE_APP_ENVIRONMENT: production');
  console.log('   - VITE_ENABLE_DEBUG_LOGS: false');
}

function showHostingInstructions() {
  console.log('\n🌐 Hosting Platform Setup Instructions:');
  console.log('======================================\n');
  
  console.log('📦 For Vercel:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Import your GitHub repository');
  console.log('3. In project settings, add these environment variables:');
  console.log('');
  
  const envVars = [
    'VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co',
    'VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
    'VITE_UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU',
    'VITE_UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api',
    'VITE_UDDOKTAPAY_ENVIRONMENT=production',
    'VITE_APP_NAME=HealthyThako',
    'VITE_APP_URL=https://healthythako.com',
    'VITE_APP_ENVIRONMENT=production',
    'VITE_PAYMENT_CURRENCY=BDT',
    'VITE_PAYMENT_SUCCESS_URL=/payment-success',
    'VITE_PAYMENT_CANCEL_URL=/payment-cancelled',
    'VITE_PAYMENT_REDIRECT_URL=/payment-redirect',
    'VITE_PLATFORM_COMMISSION=0.1',
    'VITE_DEFAULT_TRAINER_RATE=1200',
    'VITE_DEFAULT_GYM_MONTHLY_RATE=2000',
    'VITE_ENABLE_REAL_TIME=true',
    'VITE_ENABLE_NOTIFICATIONS=true',
    'VITE_ENABLE_ANALYTICS=true',
    'VITE_ENABLE_DEBUG_LOGS=false',
    'VITE_MOBILE_APP_SCHEME=healthythako',
    'VITE_MOBILE_DEEP_LINK_SUCCESS=healthythako://payment/success',
    'VITE_MOBILE_DEEP_LINK_CANCEL=healthythako://payment/cancelled',
    'VITE_SUPPORT_EMAIL=support@healthythako.com',
    'VITE_CONTACT_EMAIL=contact@healthythako.com'
  ];
  
  envVars.forEach(envVar => console.log(`   ${envVar}`));
  
  console.log('\n4. Set custom domain to: healthythako.com');
  console.log('5. Deploy the project');
  console.log('');
  
  console.log('📦 For Netlify:');
  console.log('1. Go to https://app.netlify.com');
  console.log('2. Import your GitHub repository');
  console.log('3. In Site settings > Environment variables, add the same variables above');
  console.log('4. Set custom domain to: healthythako.com');
  console.log('5. Deploy the project');
  console.log('');
}

function showBuildInstructions() {
  console.log('\n🏗️  Build and Deploy Instructions:');
  console.log('==================================\n');
  
  console.log('1. 📋 Install dependencies:');
  console.log('   npm install');
  console.log('');
  
  console.log('2. 🏗️  Build for production:');
  console.log('   npm run build');
  console.log('');
  
  console.log('3. 🧪 Test the build locally:');
  console.log('   npm run preview');
  console.log('   # Visit http://localhost:4173 to test');
  console.log('');
  
  console.log('4. 🚀 Deploy to hosting platform:');
  console.log('   # Upload dist/ folder or use platform CLI');
  console.log('');
  
  console.log('5. 🔧 Configure Supabase Edge Functions:');
  console.log('   # In Supabase Dashboard > Edge Functions > Environment Variables:');
  console.log('   # Set UDDOKTAPAY_API_KEY and SUPABASE_SERVICE_ROLE_KEY');
  console.log('');
  
  console.log('6. 🧪 Test the live website:');
  console.log('   # Visit https://healthythako.com');
  console.log('   # Test login, payment flows, API calls');
  console.log('');
}

function showTroubleshootingTips() {
  console.log('\n🔧 Troubleshooting Tips:');
  console.log('=======================\n');
  
  console.log('❌ If APIs still not working:');
  console.log('1. Check browser Developer Tools > Network tab');
  console.log('2. Look for failed requests (red entries)');
  console.log('3. Check if CORS errors appear in Console');
  console.log('4. Verify environment variables in hosting platform');
  console.log('5. Ensure build includes environment variables');
  console.log('');
  
  console.log('❌ If Supabase connection fails:');
  console.log('1. Test URL: https://lhncpcsniuxnrmabbkmr.supabase.co');
  console.log('2. Check API key is correct');
  console.log('3. Verify CORS settings in Supabase Dashboard');
  console.log('');
  
  console.log('❌ If payments not working:');
  console.log('1. Check UddoktaPay API key');
  console.log('2. Verify Edge Functions are deployed');
  console.log('3. Test Edge Function URLs directly');
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node scripts/setup-production.js [options]');
    console.log('Options:');
    console.log('  --setup         Setup production environment');
    console.log('  --hosting       Show hosting instructions');
    console.log('  --build         Show build instructions');
    console.log('  --troubleshoot  Show troubleshooting tips');
    console.log('  --help          Show this help message');
    return;
  }
  
  if (args.includes('--hosting')) {
    showHostingInstructions();
    return;
  }
  
  if (args.includes('--build')) {
    showBuildInstructions();
    return;
  }
  
  if (args.includes('--troubleshoot')) {
    showTroubleshootingTips();
    return;
  }
  
  if (args.includes('--setup')) {
    backupCurrentEnv();
    createProductionEnv();
    showBuildInstructions();
    showHostingInstructions();
    showTroubleshootingTips();
    return;
  }
  
  // Default: show all instructions
  console.log('🎯 The main issue: Your .env is configured for development (localhost)');
  console.log('🔧 Solution: Run --setup to configure for production (healthythako.com)');
  console.log('');
  console.log('Available commands:');
  console.log('  node scripts/setup-production.js --setup');
  console.log('  node scripts/setup-production.js --hosting');
  console.log('  node scripts/setup-production.js --build');
  console.log('  node scripts/setup-production.js --troubleshoot');
}

main();

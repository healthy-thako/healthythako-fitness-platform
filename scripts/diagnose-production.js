#!/usr/bin/env node

/**
 * Production Deployment Diagnostic Script for HealthyThako
 * Identifies issues with API endpoints not working on healthythako.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 HealthyThako Production Deployment Diagnosis');
console.log('===============================================\n');

function checkCurrentEnvironment() {
  console.log('📋 Current Environment Configuration:');
  console.log('====================================\n');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log('Current .env configuration:');
  envLines.forEach(line => {
    if (line.includes('=')) {
      const [key, value] = line.split('=');
      if (key.includes('API_KEY') || key.includes('SECRET')) {
        console.log(`  ${key}=***HIDDEN***`);
      } else {
        console.log(`  ${line}`);
      }
    }
  });
  
  // Check critical variables
  const criticalVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY', 
    'VITE_UDDOKTAPAY_API_KEY',
    'VITE_APP_URL'
  ];
  
  console.log('\n🔍 Critical Variables Check:');
  let allPresent = true;
  
  criticalVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      const value = envContent.split(`${varName}=`)[1]?.split('\n')[0];
      if (value && value.trim() && !value.includes('your_') && !value.includes('_here')) {
        console.log(`  ✅ ${varName}: Configured`);
      } else {
        console.log(`  ❌ ${varName}: Not properly configured`);
        allPresent = false;
      }
    } else {
      console.log(`  ❌ ${varName}: Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

function identifyHostingPlatform() {
  console.log('\n🌐 Hosting Platform Detection:');
  console.log('=============================\n');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
  const vercelJsonPath = path.join(__dirname, '..', 'vercel.json');
  
  let platform = 'unknown';
  
  if (fs.existsSync(netlifyTomlPath)) {
    platform = 'netlify';
    console.log('🔍 Detected: Netlify (netlify.toml found)');
  } else if (fs.existsSync(vercelJsonPath)) {
    platform = 'vercel';
    console.log('🔍 Detected: Vercel (vercel.json found)');
  } else {
    console.log('🔍 Platform: Unknown (manual hosting or other)');
  }
  
  return platform;
}

function generateProductionChecklist() {
  console.log('\n📋 Production Deployment Checklist:');
  console.log('===================================\n');
  
  const checklist = [
    '🔧 Environment Variables:',
    '  □ VITE_SUPABASE_URL set to: https://lhncpcsniuxnrmabbkmr.supabase.co',
    '  □ VITE_SUPABASE_ANON_KEY set with correct key',
    '  □ VITE_UDDOKTAPAY_API_KEY set to: yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU',
    '  □ VITE_APP_URL set to: https://healthythako.com',
    '  □ VITE_APP_ENVIRONMENT set to: production',
    '  □ VITE_ENABLE_DEBUG_LOGS set to: false',
    '',
    '🏗️  Build Process:',
    '  □ Run: npm run build',
    '  □ Check dist/ folder is created',
    '  □ Verify environment variables are included in build',
    '  □ Check console for build errors',
    '',
    '🌐 Hosting Platform Setup:',
    '  □ Environment variables set in hosting dashboard',
    '  □ Build command set to: npm run build',
    '  □ Publish directory set to: dist',
    '  □ Node.js version compatible (16+)',
    '',
    '🔗 Supabase Configuration:',
    '  □ Project URL accessible: https://lhncpcsniuxnrmabbkmr.supabase.co',
    '  □ Anonymous key working',
    '  □ Edge Functions deployed',
    '  □ CORS settings allow healthythako.com',
    '',
    '🧪 Testing:',
    '  □ Visit https://healthythako.com',
    '  □ Open browser developer tools',
    '  □ Check Network tab for API calls',
    '  □ Look for CORS or 404 errors',
    '  □ Test authentication flow',
    '  □ Test payment creation'
  ];
  
  checklist.forEach(item => console.log(item));
}

function generateHostingInstructions() {
  console.log('\n🚀 Hosting Platform Instructions:');
  console.log('=================================\n');
  
  console.log('📦 For Vercel:');
  console.log('1. Install Vercel CLI: npm i -g vercel');
  console.log('2. Login: vercel login');
  console.log('3. Set environment variables in Vercel dashboard:');
  console.log('   - Go to project settings');
  console.log('   - Add environment variables from .env.production');
  console.log('4. Deploy: vercel --prod');
  console.log('');
  
  console.log('📦 For Netlify:');
  console.log('1. Install Netlify CLI: npm i -g netlify-cli');
  console.log('2. Login: netlify login');
  console.log('3. Set environment variables in Netlify dashboard:');
  console.log('   - Go to Site settings > Environment variables');
  console.log('   - Add variables from .env.production');
  console.log('4. Deploy: netlify deploy --prod');
  console.log('');
  
  console.log('📦 For Manual Hosting:');
  console.log('1. Copy .env.production to .env');
  console.log('2. Run: npm run build');
  console.log('3. Upload dist/ folder to web server');
  console.log('4. Ensure server serves index.html for all routes');
  console.log('');
}

function generateDebugCommands() {
  console.log('\n🐛 Debug Commands:');
  console.log('==================\n');
  
  console.log('Test Supabase connection:');
  console.log('curl -H "apikey: YOUR_ANON_KEY" https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/');
  console.log('');
  
  console.log('Test Edge Function:');
  console.log('curl -X POST https://lhncpcsniuxnrmabbkmr.supabase.co/functions/v1/create-payment \\');
  console.log('  -H "Authorization: Bearer YOUR_ANON_KEY" \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"amount": 100, "currency": "BDT"}\'');
  console.log('');
  
  console.log('Check website in browser:');
  console.log('1. Open https://healthythako.com');
  console.log('2. Press F12 to open Developer Tools');
  console.log('3. Go to Network tab');
  console.log('4. Try to login or make API call');
  console.log('5. Look for failed requests (red entries)');
  console.log('6. Check Console tab for JavaScript errors');
  console.log('');
}

function createProductionEnvFile() {
  console.log('\n📝 Creating Production Environment File:');
  console.log('========================================\n');
  
  const productionEnv = `# HealthyThako Production Environment
# Copy these to your hosting platform's environment variables

VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U
VITE_UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
VITE_UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api
VITE_UDDOKTAPAY_ENVIRONMENT=production
VITE_APP_NAME=HealthyThako
VITE_APP_URL=https://healthythako.com
VITE_APP_ENVIRONMENT=production
VITE_PAYMENT_CURRENCY=BDT
VITE_PAYMENT_SUCCESS_URL=/payment-success
VITE_PAYMENT_CANCEL_URL=/payment-cancelled
VITE_PAYMENT_REDIRECT_URL=/payment-redirect
VITE_PLATFORM_COMMISSION=0.1
VITE_DEFAULT_TRAINER_RATE=1200
VITE_DEFAULT_GYM_MONTHLY_RATE=2000
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_LOGS=false
VITE_MOBILE_APP_SCHEME=healthythako
VITE_MOBILE_DEEP_LINK_SUCCESS=healthythako://payment/success
VITE_MOBILE_DEEP_LINK_CANCEL=healthythako://payment/cancelled
VITE_SUPPORT_EMAIL=support@healthythako.com
VITE_CONTACT_EMAIL=contact@healthythako.com`;

  const envProductionPath = path.join(__dirname, '..', '.env.production');
  fs.writeFileSync(envProductionPath, productionEnv);
  
  console.log('✅ Created .env.production file');
  console.log('📋 Copy these environment variables to your hosting platform:');
  console.log('');
  
  productionEnv.split('\n').forEach(line => {
    if (line.startsWith('VITE_') && line.includes('=')) {
      console.log(line);
    }
  });
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node scripts/diagnose-production.js [options]');
    console.log('Options:');
    console.log('  --env-check     Check current environment configuration');
    console.log('  --create-env    Create production environment file');
    console.log('  --hosting       Show hosting platform instructions');
    console.log('  --debug         Show debug commands');
    console.log('  --help          Show this help message');
    return;
  }
  
  if (args.includes('--env-check')) {
    checkCurrentEnvironment();
    return;
  }
  
  if (args.includes('--create-env')) {
    createProductionEnvFile();
    return;
  }
  
  if (args.includes('--hosting')) {
    generateHostingInstructions();
    return;
  }
  
  if (args.includes('--debug')) {
    generateDebugCommands();
    return;
  }
  
  // Default: run full diagnosis
  checkCurrentEnvironment();
  identifyHostingPlatform();
  generateProductionChecklist();
  generateHostingInstructions();
  generateDebugCommands();
}

main();

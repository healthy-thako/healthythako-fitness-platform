#!/usr/bin/env node

/**
 * Production Deployment Script for HealthyThako
 * This script helps deploy the application to production with proper environment configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 HealthyThako Production Deployment Helper');
console.log('===========================================\n');

// Check if production environment file exists
const productionEnvPath = path.join(__dirname, '..', '.env.production');
const currentEnvPath = path.join(__dirname, '..', '.env');

function copyProductionEnv() {
  console.log('📋 Setting up production environment variables...');
  
  if (!fs.existsSync(productionEnvPath)) {
    console.error('❌ .env.production file not found!');
    console.log('Please create .env.production with production settings.');
    process.exit(1);
  }
  
  // Backup current .env if it exists
  if (fs.existsSync(currentEnvPath)) {
    const backupPath = path.join(__dirname, '..', '.env.backup');
    fs.copyFileSync(currentEnvPath, backupPath);
    console.log('✅ Backed up current .env to .env.backup');
  }
  
  // Copy production environment
  fs.copyFileSync(productionEnvPath, currentEnvPath);
  console.log('✅ Production environment variables set');
}

function validateProductionConfig() {
  console.log('\n🔍 Validating production configuration...');
  
  const envContent = fs.readFileSync(currentEnvPath, 'utf8');
  const issues = [];
  
  // Check critical environment variables
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_UDDOKTAPAY_API_KEY',
    'VITE_APP_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)) {
      issues.push(`❌ ${varName} is missing or not configured`);
    }
  });
  
  // Check if production URL is set correctly
  if (envContent.includes('VITE_APP_URL=http://localhost')) {
    issues.push('❌ VITE_APP_URL still points to localhost');
  }
  
  // Check if debug logs are disabled
  if (envContent.includes('VITE_ENABLE_DEBUG_LOGS=true')) {
    issues.push('⚠️  Debug logs should be disabled in production');
  }
  
  if (issues.length > 0) {
    console.log('\n🚨 Configuration Issues Found:');
    issues.forEach(issue => console.log(`  ${issue}`));
    console.log('\nPlease fix these issues before deploying to production.\n');
    return false;
  }
  
  console.log('✅ Production configuration looks good!');
  return true;
}

function showDeploymentInstructions() {
  console.log('\n📝 Production Deployment Instructions:');
  console.log('=====================================\n');
  
  console.log('1. 🏗️  Build the application:');
  console.log('   npm run build\n');
  
  console.log('2. 🌐 Deploy to your hosting platform:');
  console.log('   - Vercel: vercel --prod');
  console.log('   - Netlify: netlify deploy --prod');
  console.log('   - Manual: Upload dist/ folder to your web server\n');
  
  console.log('3. 🔧 Configure Supabase Edge Functions:');
  console.log('   - Set UDDOKTAPAY_API_KEY in Supabase Dashboard');
  console.log('   - Set SUPABASE_SERVICE_ROLE_KEY in Supabase Dashboard');
  console.log('   - Deploy Edge Functions: supabase functions deploy --project-ref lhncpcsniuxnrmabbkmr\n');
  
  console.log('4. 🧪 Test the deployment:');
  console.log('   - Visit https://healthythako.com');
  console.log('   - Test payment flow');
  console.log('   - Verify mobile app deep linking\n');
  
  console.log('5. 📱 Update mobile app configuration:');
  console.log('   - Update API base URL to https://healthythako.com');
  console.log('   - Test deep link redirects');
  console.log('   - Verify payment flow in mobile app\n');
}

function showEnvironmentVariablesForHosting() {
  console.log('🌐 Environment Variables for Hosting Platforms:');
  console.log('===============================================\n');
  
  const envContent = fs.readFileSync(currentEnvPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('Copy these environment variables to your hosting platform:\n');
  
  lines.forEach(line => {
    if (line.startsWith('VITE_') && line.includes('=') && !line.startsWith('#')) {
      console.log(line);
    }
  });
  
  console.log('\n📋 For Vercel: Add these to vercel.json or Vercel Dashboard');
  console.log('📋 For Netlify: Add these to Netlify Dashboard or netlify.toml');
  console.log('📋 For other platforms: Set these as environment variables\n');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node scripts/deploy-to-production.js [options]');
    console.log('Options:');
    console.log('  --setup     Copy production environment and validate');
    console.log('  --validate  Only validate current configuration');
    console.log('  --env-vars  Show environment variables for hosting platforms');
    console.log('  --help      Show this help message');
    return;
  }
  
  if (args.includes('--validate')) {
    validateProductionConfig();
    return;
  }
  
  if (args.includes('--env-vars')) {
    showEnvironmentVariablesForHosting();
    return;
  }
  
  if (args.includes('--setup')) {
    copyProductionEnv();
    if (validateProductionConfig()) {
      showDeploymentInstructions();
      showEnvironmentVariablesForHosting();
    }
    return;
  }
  
  // Default: show instructions
  console.log('Run with --setup to configure production environment');
  console.log('Run with --help to see all options\n');
  showDeploymentInstructions();
}

main();

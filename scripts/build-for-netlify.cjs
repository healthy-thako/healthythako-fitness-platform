#!/usr/bin/env node

/**
 * Build script specifically for Netlify deployment
 * Ensures all environment variables and configurations are correct
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building HealthyThako for Netlify Deployment');
console.log('===============================================\n');

// Production environment variables
const PRODUCTION_ENV = {
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
  'VITE_PLATFORM_COMMISSION': '0.1',
  'VITE_DEFAULT_TRAINER_RATE': '1200',
  'VITE_DEFAULT_GYM_MONTHLY_RATE': '2000',
  'VITE_ENABLE_REAL_TIME': 'true',
  'VITE_ENABLE_NOTIFICATIONS': 'true',
  'VITE_ENABLE_ANALYTICS': 'true',
  'VITE_ENABLE_DEBUG_LOGS': 'false',
  'VITE_MOBILE_APP_SCHEME': 'healthythako',
  'VITE_MOBILE_DEEP_LINK_SUCCESS': 'healthythako://payment/success',
  'VITE_MOBILE_DEEP_LINK_CANCEL': 'healthythako://payment/cancelled',
  'VITE_SUPPORT_EMAIL': 'support@healthythako.com',
  'VITE_CONTACT_EMAIL': 'contact@healthythako.com',
  'VITE_API_RATE_LIMIT': '100',
  'VITE_API_RATE_WINDOW': '60000',
  'VITE_MAX_FILE_SIZE': '5242880',
  'VITE_ALLOWED_FILE_TYPES': 'image/jpeg,image/png,image/webp,application/pdf'
};

function createProductionEnvFile() {
  console.log('📝 Creating production environment file...');
  
  const envContent = Object.entries(PRODUCTION_ENV)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(__dirname, '..', '.env.production');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env.production created');
}

function createNetlifyEnvFile() {
  console.log('📝 Creating .env file for build...');
  
  // Create a temporary .env file for the build process
  const envContent = Object.entries(PRODUCTION_ENV)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env created for build');
}

function cleanDist() {
  console.log('🧹 Cleaning dist directory...');
  
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  
  console.log('✅ Dist directory cleaned');
}

function buildProject() {
  console.log('🏗️  Building project...');
  
  try {
    // Set NODE_ENV to production
    process.env.NODE_ENV = 'production';
    
    // Run the build command
    execSync('npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, ...PRODUCTION_ENV }
    });
    
    console.log('✅ Build completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

function verifyBuild() {
  console.log('🔍 Verifying build output...');
  
  const distPath = path.join(__dirname, '..', 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found');
    return false;
  }
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in dist');
    return false;
  }
  
  // Check if environment variables are properly embedded
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (indexContent.includes('lhncpcsniuxnrmabbkmr.supabase.co')) {
    console.log('✅ Supabase URL found in build');
  } else {
    console.warn('⚠️  Supabase URL not found in build - check env vars');
  }
  
  // Check for main JS file
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    if (jsFiles.length > 0) {
      console.log(`✅ Found ${jsFiles.length} JS files in assets`);
    } else {
      console.error('❌ No JS files found in assets');
      return false;
    }
  } else {
    console.error('❌ Assets directory not found');
    return false;
  }
  
  console.log('✅ Build verification passed');
  return true;
}

function generateDeploymentInstructions() {
  console.log('\n🚀 Deployment Instructions');
  console.log('==========================\n');
  
  console.log('1. 📤 Upload to Netlify:');
  console.log('   - Drag and drop the "dist" folder to Netlify dashboard');
  console.log('   - Or use: netlify deploy --prod --dir=dist\n');
  
  console.log('2. 🌐 Set Environment Variables in Netlify:');
  console.log('   Go to Site settings > Environment variables and add:\n');
  
  Object.entries(PRODUCTION_ENV).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`);
  });
  
  console.log('\n3. 🔧 Netlify Build Settings:');
  console.log('   - Build command: npm run build');
  console.log('   - Publish directory: dist');
  console.log('   - Node version: 18\n');
  
  console.log('4. 🔍 After deployment, test:');
  console.log('   - Visit /deployment-test to run diagnostics');
  console.log('   - Open browser console and check for errors');
  console.log('   - Test data fetching (trainers, gyms)');
  console.log('   - Verify authentication works\n');
}

function cleanup() {
  console.log('🧹 Cleaning up temporary files...');
  
  const tempEnvPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(tempEnvPath)) {
    fs.unlinkSync(tempEnvPath);
    console.log('✅ Temporary .env file removed');
  }
}

// Main execution
function main() {
  try {
    createProductionEnvFile();
    createNetlifyEnvFile();
    cleanDist();
    
    const buildSuccess = buildProject();
    
    if (buildSuccess) {
      const verifySuccess = verifyBuild();
      
      if (verifySuccess) {
        generateDeploymentInstructions();
        console.log('\n🎉 Build completed successfully!');
        console.log('Your dist folder is ready for Netlify deployment.');
      } else {
        console.error('\n❌ Build verification failed!');
        process.exit(1);
      }
    } else {
      console.error('\n❌ Build failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

main();

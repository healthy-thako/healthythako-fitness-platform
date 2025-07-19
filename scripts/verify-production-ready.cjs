#!/usr/bin/env node

/**
 * Production Readiness Verification Script
 * Checks if debug components and development features are properly disabled
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Readiness...\n');

// Check environment configuration
function checkEnvironmentConfig() {
  console.log('📋 Checking Environment Configuration:');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('  ❌ .env file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check critical production settings
  const checks = [
    { key: 'VITE_APP_ENVIRONMENT', expected: 'production', description: 'App Environment' },
    { key: 'VITE_ENABLE_DEBUG_LOGS', expected: 'false', description: 'Debug Logs' },
    { key: 'VITE_APP_URL', expected: 'https://healthythako.com', description: 'App URL' }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const regex = new RegExp(`${check.key}=(.+)`);
    const match = envContent.match(regex);
    
    if (match && match[1].trim() === check.expected) {
      console.log(`  ✅ ${check.description}: ${match[1].trim()}`);
    } else {
      console.log(`  ❌ ${check.description}: Expected "${check.expected}", got "${match ? match[1].trim() : 'not found'}"`);
      allPassed = false;
    }
  });
  
  return allPassed;
}

// Check if debug components are properly conditionally rendered
function checkDebugComponents() {
  console.log('\n🔧 Checking Debug Components:');
  
  const filesToCheck = [
    {
      path: 'src/App.tsx',
      patterns: [
        /import\.meta\.env\.DEV && import\.meta\.env\.VITE_ENABLE_DEBUG_LOGS === 'true' && <SessionDebugger/,
        /import\.meta\.env\.DEV && import\.meta\.env\.VITE_ENABLE_DEBUG_LOGS === 'true'/
      ],
      description: 'App.tsx debug components'
    },
    {
      path: 'src/pages/ClientDashboard.tsx',
      patterns: [
        /import\.meta\.env\.DEV && import\.meta\.env\.VITE_ENABLE_DEBUG_LOGS === 'true'/
      ],
      description: 'ClientDashboard debug components'
    }
  ];
  
  let allPassed = true;
  
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, '..', file.path);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ ${file.description}: File not found`);
      allPassed = false;
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasConditionalRendering = file.patterns.some(pattern => pattern.test(content));
    
    if (hasConditionalRendering) {
      console.log(`  ✅ ${file.description}: Properly conditionally rendered`);
    } else {
      console.log(`  ❌ ${file.description}: Debug components not properly disabled`);
      allPassed = false;
    }
  });
  
  return allPassed;
}

// Generate production checklist
function generateProductionChecklist() {
  console.log('\n📋 Production Deployment Checklist:');
  
  const checklist = [
    '🔧 Environment Variables:',
    '  □ VITE_ENABLE_DEBUG_LOGS=false',
    '  □ VITE_APP_ENVIRONMENT=production',
    '  □ VITE_APP_URL=https://healthythako.com',
    '',
    '🚀 Build Process:',
    '  □ Run: npm run build',
    '  □ Check dist/ folder is created',
    '  □ Verify no debug routes are accessible',
    '  □ Test production build with: npm run preview',
    '',
    '🔒 Security:',
    '  □ Debug components disabled',
    '  □ Test routes disabled',
    '  □ Console logs minimized',
    '  □ Environment variables secured',
    '',
    '🌐 Deployment:',
    '  □ Upload dist/ folder to hosting platform',
    '  □ Configure environment variables on hosting platform',
    '  □ Test live deployment',
    '  □ Verify all functionality works'
  ];
  
  checklist.forEach(item => console.log(item));
}

// Main execution
function main() {
  const results = [
    checkEnvironmentConfig(),
    checkDebugComponents()
  ];
  
  const allPassed = results.every(result => result);
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 Production Readiness: PASSED');
    console.log('✅ Your application is ready for production deployment!');
  } else {
    console.log('❌ Production Readiness: FAILED');
    console.log('⚠️  Please fix the issues above before deploying to production.');
  }
  
  generateProductionChecklist();
  
  return allPassed;
}

// Run the verification
const success = main();
process.exit(success ? 0 : 1);

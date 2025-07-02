#!/usr/bin/env node

/**
 * Verify build output for HealthyThako deployment
 * Checks if all required files are present and correctly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

console.log('🔍 Verifying HealthyThako build output...\n');

const checks = [
  {
    name: 'Main index.html',
    path: path.join(distDir, 'index.html'),
    required: true
  },
  {
    name: 'Payment redirect handler',
    path: path.join(distDir, 'payment-redirect', 'index.html'),
    required: true,
    minSize: 30000 // Should be ~33KB
  },
  {
    name: 'Netlify redirects',
    path: path.join(distDir, '_redirects'),
    required: false
  },
  {
    name: 'Netlify headers',
    path: path.join(distDir, '_headers'),
    required: false
  },
  {
    name: 'Assets directory',
    path: path.join(distDir, 'assets'),
    required: true,
    isDirectory: true
  }
];

let allPassed = true;

checks.forEach(check => {
  const exists = fs.existsSync(check.path);
  
  if (!exists) {
    if (check.required) {
      console.log(`❌ FAIL: ${check.name} - File not found: ${check.path}`);
      allPassed = false;
    } else {
      console.log(`⚠️  WARN: ${check.name} - Optional file not found: ${check.path}`);
    }
    return;
  }

  if (check.isDirectory) {
    const isDir = fs.statSync(check.path).isDirectory();
    if (isDir) {
      console.log(`✅ PASS: ${check.name} - Directory exists`);
    } else {
      console.log(`❌ FAIL: ${check.name} - Expected directory, found file`);
      allPassed = false;
    }
    return;
  }

  const stats = fs.statSync(check.path);
  
  if (check.minSize && stats.size < check.minSize) {
    console.log(`❌ FAIL: ${check.name} - File too small (${stats.size} bytes, expected >${check.minSize})`);
    allPassed = false;
  } else {
    console.log(`✅ PASS: ${check.name} - File exists (${stats.size} bytes)`);
  }
});

// Check payment redirect content
const paymentRedirectPath = path.join(distDir, 'payment-redirect', 'index.html');
if (fs.existsSync(paymentRedirectPath)) {
  const content = fs.readFileSync(paymentRedirectPath, 'utf8');
  
  const contentChecks = [
    {
      name: 'Supabase URL',
      pattern: /lhncpcsniuxnrmabbkmr\.supabase\.co/,
      required: true
    },
    {
      name: 'Deep link scheme',
      pattern: /healthythako:\/\//,
      required: true
    },
    {
      name: 'Edge Function integration',
      pattern: /payment-redirect-handler/,
      required: true
    },
    {
      name: 'CSP headers',
      pattern: /Content-Security-Policy/,
      required: true
    }
  ];

  console.log('\n🔍 Checking payment redirect content...');
  
  contentChecks.forEach(check => {
    const found = check.pattern.test(content);
    if (found) {
      console.log(`✅ PASS: ${check.name} - Found in content`);
    } else {
      if (check.required) {
        console.log(`❌ FAIL: ${check.name} - Not found in content`);
        allPassed = false;
      } else {
        console.log(`⚠️  WARN: ${check.name} - Not found in content`);
      }
    }
  });
}

// Summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 BUILD VERIFICATION PASSED!');
  console.log('✅ All required files are present and correctly configured');
  console.log('✅ Payment redirect handler is ready for deployment');
  console.log('\n📋 Next steps:');
  console.log('1. Upload the dist/ folder to Netlify');
  console.log('2. Test https://healthythako.com/payment-redirect/');
  console.log('3. Verify payment flow with UddoktaPay');
} else {
  console.log('❌ BUILD VERIFICATION FAILED!');
  console.log('❌ Some required files are missing or incorrect');
  console.log('\n🔧 Fix the issues above and run npm run build again');
  process.exit(1);
}

console.log('='.repeat(50));

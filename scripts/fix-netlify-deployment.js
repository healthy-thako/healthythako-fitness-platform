#!/usr/bin/env node

/**
 * Netlify Deployment Fix Script for HealthyThako
 * Fixes MIME type errors and deployment issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Netlify Deployment Fix for HealthyThako');
console.log('==========================================\n');

function checkViteConfig() {
  console.log('📋 Checking Vite Configuration...');
  
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    console.log('❌ vite.config.ts not found!');
    return false;
  }
  
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check if proper configuration exists
  if (viteConfig.includes('build:') && viteConfig.includes('outDir:')) {
    console.log('✅ Vite config looks good');
    return true;
  } else {
    console.log('⚠️  Vite config might need updates');
    return false;
  }
}

function checkNetlifyFiles() {
  console.log('\n📋 Checking Netlify Configuration Files...');
  
  const netlifyToml = path.join(__dirname, '..', 'netlify.toml');
  const headersFile = path.join(__dirname, '..', 'public', '_headers');
  const redirectsFile = path.join(__dirname, '..', 'public', '_redirects');
  
  let allGood = true;
  
  // Check netlify.toml
  if (fs.existsSync(netlifyToml)) {
    const content = fs.readFileSync(netlifyToml, 'utf8');
    if (content.includes('publish = "dist"') && content.includes('text/javascript')) {
      console.log('✅ netlify.toml configured correctly');
    } else {
      console.log('❌ netlify.toml needs updates');
      allGood = false;
    }
  } else {
    console.log('❌ netlify.toml missing');
    allGood = false;
  }
  
  // Check _headers
  if (fs.existsSync(headersFile)) {
    console.log('✅ _headers file exists');
  } else {
    console.log('❌ _headers file missing');
    allGood = false;
  }
  
  // Check _redirects
  if (fs.existsSync(redirectsFile)) {
    console.log('✅ _redirects file exists');
  } else {
    console.log('❌ _redirects file missing');
    allGood = false;
  }
  
  return allGood;
}

function checkBuildOutput() {
  console.log('\n📋 Checking Build Output...');
  
  const distPath = path.join(__dirname, '..', 'dist');
  const indexPath = path.join(distPath, 'index.html');
  const assetsPath = path.join(distPath, 'assets');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ dist folder not found - run npm run build');
    return false;
  }
  
  if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html not found in dist folder');
    return false;
  }
  
  if (!fs.existsSync(assetsPath)) {
    console.log('❌ assets folder not found in dist');
    return false;
  }
  
  // Check for JS files in assets
  const assetFiles = fs.readdirSync(assetsPath);
  const jsFiles = assetFiles.filter(file => file.endsWith('.js'));
  
  if (jsFiles.length === 0) {
    console.log('❌ No JavaScript files found in assets');
    return false;
  }
  
  console.log(`✅ Build output looks good (${jsFiles.length} JS files found)`);
  return true;
}

function generateNetlifyDeployCommands() {
  console.log('\n🚀 Netlify Deployment Commands:');
  console.log('===============================\n');
  
  console.log('1. 🏗️  Rebuild the project:');
  console.log('   npm run build\n');
  
  console.log('2. 📤 Deploy to Netlify:');
  console.log('   # Option A: Drag and drop dist/ folder to Netlify dashboard');
  console.log('   # Option B: Use Netlify CLI');
  console.log('   netlify deploy --prod --dir=dist\n');
  
  console.log('3. 🔧 Check Netlify Build Settings:');
  console.log('   - Build command: npm run build');
  console.log('   - Publish directory: dist');
  console.log('   - Node version: 18\n');
  
  console.log('4. 🌐 Set Environment Variables in Netlify:');
  console.log('   Go to Site settings > Environment variables and add:');
  
  const envVars = [
    'VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co',
    'VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
    'VITE_UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU',
    'VITE_APP_URL=https://healthythako.com',
    'VITE_APP_ENVIRONMENT=production'
  ];
  
  envVars.forEach(envVar => console.log(`   ${envVar}`));
  console.log('   ... (and all other VITE_ variables from .env.production)\n');
}

function showTroubleshootingSteps() {
  console.log('\n🔧 Troubleshooting MIME Type Errors:');
  console.log('====================================\n');
  
  console.log('❌ If you still see MIME type errors:');
  console.log('1. Clear browser cache and hard refresh (Ctrl+Shift+R)');
  console.log('2. Check Netlify deploy logs for errors');
  console.log('3. Verify all files are uploaded correctly');
  console.log('4. Check Network tab in browser dev tools');
  console.log('5. Ensure _headers file is in public/ folder\n');
  
  console.log('❌ If build fails:');
  console.log('1. Check Node.js version (should be 18+)');
  console.log('2. Clear node_modules and reinstall: rm -rf node_modules && npm install');
  console.log('3. Check for TypeScript errors: npm run type-check');
  console.log('4. Verify all environment variables are set\n');
  
  console.log('❌ If routing doesn\'t work:');
  console.log('1. Check _redirects file exists in public/');
  console.log('2. Verify netlify.toml has SPA redirect');
  console.log('3. Test direct URL access to routes\n');
}

function runDiagnostics() {
  console.log('🔍 Running Full Diagnostics...\n');
  
  const viteOk = checkViteConfig();
  const netlifyOk = checkNetlifyFiles();
  const buildOk = checkBuildOutput();
  
  console.log('\n📊 Diagnostic Results:');
  console.log('======================');
  console.log(`Vite Config: ${viteOk ? '✅' : '❌'}`);
  console.log(`Netlify Config: ${netlifyOk ? '✅' : '❌'}`);
  console.log(`Build Output: ${buildOk ? '✅' : '❌'}`);
  
  if (viteOk && netlifyOk && buildOk) {
    console.log('\n🎉 All checks passed! Ready for deployment.');
    generateNetlifyDeployCommands();
  } else {
    console.log('\n⚠️  Issues found. Please fix them before deploying.');
    showTroubleshootingSteps();
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node scripts/fix-netlify-deployment.js [options]');
    console.log('Options:');
    console.log('  --check         Run diagnostics only');
    console.log('  --deploy        Show deployment commands');
    console.log('  --troubleshoot  Show troubleshooting steps');
    console.log('  --help          Show this help message');
    return;
  }
  
  if (args.includes('--check')) {
    runDiagnostics();
    return;
  }
  
  if (args.includes('--deploy')) {
    generateNetlifyDeployCommands();
    return;
  }
  
  if (args.includes('--troubleshoot')) {
    showTroubleshootingSteps();
    return;
  }
  
  // Default: run full diagnostics and show next steps
  runDiagnostics();
}

main();

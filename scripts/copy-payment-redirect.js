#!/usr/bin/env node

/**
 * Copy payment redirect handler to dist directory
 * Cross-platform script for Windows/Linux/Mac
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, '..', 'public', 'payment-redirect', 'index.html');
const targetDir = path.join(__dirname, '..', 'dist', 'payment-redirect');
const targetFile = path.join(targetDir, 'index.html');

console.log('🔄 Copying payment redirect handler...');

try {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('✅ Created directory:', targetDir);
  }

  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ Source file not found:', sourceFile);
    process.exit(1);
  }

  // Copy the file
  fs.copyFileSync(sourceFile, targetFile);
  console.log('✅ Payment redirect handler copied successfully');
  console.log('   From:', sourceFile);
  console.log('   To:', targetFile);

  // Verify the copy
  if (fs.existsSync(targetFile)) {
    const stats = fs.statSync(targetFile);
    console.log('✅ File verified - Size:', stats.size, 'bytes');
  } else {
    console.error('❌ Copy verification failed');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error copying payment redirect handler:', error.message);
  process.exit(1);
}

console.log('🎉 Payment redirect handler deployment ready!');

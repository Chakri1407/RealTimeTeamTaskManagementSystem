#!/usr/bin/env node

/**
 * Pre-Deployment Validation Script
 * Checks if your project is ready for Vercel deployment
 * 
 * Usage: node scripts/pre-deploy-check.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, condition, details = '') {
  const status = condition ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (details && !condition) {
    console.log(`   → ${details}`);
  }
  checks.push({ name, passed: condition });
}

console.log('\n🔍 Pre-Deployment Validation\n');
console.log('=' .repeat(50));

// Check 1: Project structure
console.log('\n📂 Project Structure');
check('package.json exists', fs.existsSync('package.json'));
check('src/server.ts exists', fs.existsSync('src/server.ts'));
check('vercel.json exists', fs.existsSync('vercel.json'));
check('tsconfig.json exists', fs.existsSync('tsconfig.json'));

// Check 2: Build configuration
console.log('\n🛠️ Build Configuration');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check('Build script defined', packageJson.scripts?.build, 'Add "build": "tsc" to scripts');
check('Start script defined', packageJson.scripts?.start, 'Add "start": "node dist/server.js" to scripts');
check('Main entry points to compiled code', packageJson.main?.includes('dist'), 'Set main to "dist/server.js"');

// Check 3: Dependencies
console.log('\n📦 Dependencies');
check('express installed', packageJson.dependencies?.express, 'Run npm install express');
check('mongoose installed', packageJson.dependencies?.mongoose, 'Run npm install mongoose');
check('socket.io installed', packageJson.dependencies?.['socket.io'], 'Run npm install socket.io');
check('jsonwebtoken installed', packageJson.dependencies?.jsonwebtoken, 'Run npm install jsonwebtoken');
check('bcryptjs installed', packageJson.dependencies?.bcryptjs, 'Run npm install bcryptjs');

// Check 4: Environment setup
console.log('\n🔐 Environment Setup');
check('.env file exists', fs.existsSync('.env'), 'Create .env file with your local config');
check('.env in .gitignore', fs.readFileSync('.gitignore', 'utf8').includes('.env'), 'Add .env to .gitignore');
check('.env.production exists', fs.existsSync('.env.production'), 'Template created (update with your values)');

// Check 5: Git setup
console.log('\n📚 Git Setup');
const gitDir = fs.existsSync('.git');
check('Git repository initialized', gitDir, 'Run git init && git add . && git commit -m "Initial commit"');
if (gitDir) {
  try {
    const branch = require('child_process')
      .execSync('git branch --show-current', { encoding: 'utf8' })
      .trim();
    check('On master/main branch', ['master', 'main'].includes(branch), `Switch to master: git checkout -b master`);
  } catch (e) {
    check('On master/main branch', false, 'Unable to detect branch');
  }
}

// Check 6: Configuration files
console.log('\n⚙️ Configuration Files');
const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
check('vercel.json has buildCommand', vercelJson.buildCommand, 'Should have: "npm run build"');
check('vercel.json has outputDirectory', vercelJson.outputDirectory, 'Should have: "dist"');

const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
check('TypeScript output directory set', tsconfig.compilerOptions?.outDir === './dist', 'Should be "outDir": "./dist"');

// Check 7: Generate secrets
console.log('\n🔑 Security Setup');
const crypto = require('crypto');

function generateSecret() {
  return crypto.randomBytes(64).toString('hex');
}

console.log('\n   Your generated secrets (save these for Vercel):');
console.log(`\n   JWT_SECRET=${generateSecret()}`);
console.log(`\n   JWT_REFRESH_SECRET=${generateSecret()}\n`);

// Summary
console.log('\n' + '='.repeat(50));
const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n📊 Summary: ${passed}/${total} checks passed (${percentage}%)\n`);

if (percentage === 100) {
  console.log('✅ Your project is ready for Vercel deployment!\n');
  console.log('Next steps:');
  console.log('1. Read QUICK_DEPLOY.md');
  console.log('2. Set up MongoDB Atlas');
  console.log('3. Go to https://vercel.com/new');
  console.log('4. Import your GitHub repository');
  console.log('5. Add environment variables');
  console.log('6. Deploy!\n');
} else {
  console.log('⚠️ Please fix the issues above before deploying.\n');
  console.log('Failed checks:');
  checks.filter(c => !c.passed).forEach(c => {
    console.log(`  ❌ ${c.name}`);
  });
  console.log();
}

console.log('For detailed deployment guide, see: VERCEL_DEPLOYMENT.md\n');

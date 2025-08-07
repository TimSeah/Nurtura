#!/usr/bin/env node

/**
 * Simple Fuzz Test Runner
 * Run this to execute all fuzz tests
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Nurtura Backend Fuzz Testing Suite\n');

const tests = [
  {
    name: '🔒 Security Fuzz Tests',
    command: 'npx jest tests/fuzz/security-fuzz.test.js --testTimeout=60000',
    description: 'Testing for SQL injection, XSS, and other security vulnerabilities'
  },
  {
    name: '📋 Property-Based Fuzz Tests', 
    command: 'npx jest tests/fuzz/property-based-fuzz.test.js --testTimeout=60000',
    description: 'Testing business logic with property-based testing'
  },
  {
    name: '🌐 API Endpoint Fuzzer',
    command: 'node tests/fuzz/api-fuzzer.js',
    description: 'Fuzzing all API endpoints with random data'
  }
];

async function runTest(test) {
  console.log(`\n${test.name}`);
  console.log('─'.repeat(50));
  console.log(test.description);
  console.log('');
  
  try {
    const output = execSync(test.command, { 
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 120000 // 2 minutes timeout
    });
    
    console.log(output);
    console.log(`✅ ${test.name} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${test.name} failed:`);
    console.error(error.stdout || error.message);
    return false;
  }
}

async function runAllTests() {
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await runTest(test);
    if (success) passed++;
  }
  
  console.log('\n📊 Fuzz Testing Summary');
  console.log('═'.repeat(50));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${(passed/total*100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All fuzz tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some fuzz tests failed. Check the output above.');
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Fuzz testing interrupted by user');
  process.exit(1);
});

runAllTests().catch(err => {
  console.error('Fuzz test runner failed:', err);
  process.exit(1);
});

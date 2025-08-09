/**
 * Simple Fuzz Test Check
 * Quick test to verify everything is working
 */

console.log('🧪 Testing Fuzz Framework...\n');

// Test 1: Check dependencies
try {
  const { faker } = require('@faker-js/faker');
  const fc = require('fast-check');
  console.log('✅ Dependencies loaded successfully');
  console.log(`   - Faker: ${faker.person.firstName()}`);
  console.log('   - Fast-check: Available');
} catch (error) {
  console.log('❌ Dependency error:', error.message);
  process.exit(1);
}

// Test 2: Security payload generation
console.log('\n🔒 Testing Security Payloads...');
const securityPayloads = [
  "' OR '1'='1",
  '<script>alert("xss")</script>',
  '; rm -rf /',
  '../../../etc/passwd'
];

securityPayloads.forEach((payload, i) => {
  console.log(`   ${i + 1}. ${payload.substring(0, 30)}${payload.length > 30 ? '...' : ''}`);
});

// Test 3: Property-based test simulation
console.log('\n📋 Testing Property-Based Generation...');
try {
  const fc = require('fast-check');
  
  // Generate 5 random test cases
  for (let i = 0; i < 5; i++) {
    const testCase = fc.sample(fc.record({
      username: fc.string({ minLength: 1, maxLength: 20 }),
      age: fc.integer({ min: 1, max: 100 }),
      email: fc.emailAddress()
    }), 1)[0];
    
    console.log(`   Test ${i + 1}: ${JSON.stringify(testCase)}`);
  }
  
  console.log('✅ Property-based testing working');
} catch (error) {
  console.log('❌ Property-based testing error:', error.message);
}

// Test 4: Input validation simulation
console.log('\n🛡️  Testing Input Validation...');
function validateInput(input) {
  const issues = [];
  
  // XSS detection
  if (/<script|javascript:|on\w+\s*=/.test(input)) {
    issues.push('XSS');
  }
  
  // SQL injection detection
  if (/'.*or.*'|union.*select|drop.*table/i.test(input)) {
    issues.push('SQL_INJECTION');
  }
  
  return issues;
}

const testInputs = [
  'normal input',
  '<script>alert("xss")</script>',
  "' OR '1'='1",
  'safe-username_123'
];

testInputs.forEach((input, i) => {
  const issues = validateInput(input);
  const status = issues.length > 0 ? '⚠️' : '✅';
  console.log(`   ${status} "${input}" → ${issues.length > 0 ? issues.join(', ') : 'SAFE'}`);
});

console.log('\n🎉 Fuzz Testing Framework Check Complete!');
console.log('\n📌 Next Steps:');
console.log('   • Run: npm run test:fuzz');
console.log('   • Run: npm run fuzz:security'); 
console.log('   • Run: node tests/fuzz/api-fuzzer.js');

process.exit(0);

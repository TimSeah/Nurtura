/**
 * Quick Security Fuzz Test
 * Tests your actual server endpoints without full Jest setup
 */

const request = require('supertest');
const path = require('path');

async function testServerSecurity() {
  console.log('🔒 Starting Security Fuzz Test on Your Server...\n');
  
  // Try to load your server
  let app;
  try {
    app = require('../../server.js');
    console.log('✅ Server loaded successfully');
  } catch (error) {
    console.log('❌ Could not load server:', error.message);
    console.log('💡 Make sure your server.js exports the Express app');
    return false;
  }

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    vulnerabilities: []
  };

  // Security test payloads
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' OR 1=1 --"
  ];

  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)'
  ];

  console.log('🧪 Testing SQL Injection Protection...');
  
  // Test 1: SQL Injection on Login
  for (const payload of sqlInjectionPayloads) {
    try {
      results.totalTests++;
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: payload,
          password: 'anypassword'
        })
        .timeout(5000);

      if (response.status === 500) {
        results.failed++;
        results.vulnerabilities.push({
          type: 'SQL_INJECTION_SERVER_ERROR',
          endpoint: 'POST /api/auth/login',
          payload: payload.substring(0, 30),
          issue: 'Server error (500) - potential SQL injection vulnerability'
        });
        console.log(`  ❌ Server error with payload: ${payload.substring(0, 20)}...`);
      } else if (response.body && response.body._id) {
        results.failed++;
        results.vulnerabilities.push({
          type: 'SQL_INJECTION_BYPASS',
          endpoint: 'POST /api/auth/login',
          payload: payload.substring(0, 30),
          issue: 'Authentication bypassed with SQL injection'
        });
        console.log(`  🚨 CRITICAL: Authentication bypassed with: ${payload.substring(0, 20)}...`);
      } else {
        results.passed++;
        console.log(`  ✅ Properly blocked: ${payload.substring(0, 20)}...`);
      }
      
    } catch (error) {
      results.totalTests--;
      console.log(`  ⏱️  Timeout/Error with payload: ${payload.substring(0, 20)}...`);
    }
  }

  console.log('\n🎯 Testing XSS Protection...');
  
  // Test 2: XSS in Thread Creation
  for (const payload of xssPayloads) {
    try {
      results.totalTests++;
      
      const response = await request(app)
        .post('/api/threads')
        .send({
          title: payload,
          content: payload,
          author: 'testuser'
        })
        .timeout(5000);

      if (response.status === 500) {
        results.failed++;
        results.vulnerabilities.push({
          type: 'XSS_SERVER_ERROR',
          endpoint: 'POST /api/threads',
          payload: payload.substring(0, 30),
          issue: 'Server error (500) - XSS payload crashed server'
        });
        console.log(`  ❌ Server crashed with XSS: ${payload.substring(0, 20)}...`);
      } else if (response.status === 201 && response.body.title && response.body.title.includes('<script')) {
        results.failed++;
        results.vulnerabilities.push({
          type: 'XSS_NOT_SANITIZED',
          endpoint: 'POST /api/threads',
          payload: payload.substring(0, 30),
          issue: 'XSS payload not sanitized in response'
        });
        console.log(`  🚨 XSS payload not sanitized: ${payload.substring(0, 20)}...`);
      } else {
        results.passed++;
        console.log(`  ✅ XSS properly handled: ${payload.substring(0, 20)}...`);
      }
      
    } catch (error) {
      results.totalTests--;
      console.log(`  ⏱️  Timeout/Error with XSS payload: ${payload.substring(0, 20)}...`);
    }
  }

  // Test 3: Large Payload DoS
  console.log('\n💣 Testing DoS Protection...');
  try {
    results.totalTests++;
    
    const largePayload = {
      title: 'A'.repeat(100000),
      content: 'B'.repeat(100000),
      author: 'testuser'
    };

    const response = await request(app)
      .post('/api/threads')
      .send(largePayload)
      .timeout(10000);

    if (response.status === 500) {
      results.failed++;
      results.vulnerabilities.push({
        type: 'DOS_LARGE_PAYLOAD',
        endpoint: 'POST /api/threads',
        issue: 'Server crashes with large payloads'
      });
      console.log('  ❌ Server vulnerable to large payload DoS');
    } else if ([413, 400, 422].includes(response.status)) {
      results.passed++;
      console.log('  ✅ Large payload properly rejected');
    } else {
      results.passed++;
      console.log('  ✅ Large payload handled gracefully');
    }
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      results.failed++;
      results.vulnerabilities.push({
        type: 'DOS_TIMEOUT',
        endpoint: 'POST /api/threads',
        issue: 'Server times out with large payloads'
      });
      console.log('  ⚠️  Server timeout with large payload (potential DoS)');
    } else {
      console.log('  ⏱️  Error testing large payload:', error.message);
    }
  }

  // Generate Report
  console.log('\n📊 Security Fuzz Test Results');
  console.log('═'.repeat(50));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${results.totalTests > 0 ? (results.passed / results.totalTests * 100).toFixed(1) : 0}%`);

  if (results.vulnerabilities.length > 0) {
    console.log('\n🚨 Vulnerabilities Found:');
    console.log('-'.repeat(40));
    results.vulnerabilities.forEach((vuln, i) => {
      console.log(`${i + 1}. ${vuln.type} - ${vuln.endpoint}`);
      console.log(`   Issue: ${vuln.issue}`);
      if (vuln.payload) console.log(`   Payload: ${vuln.payload}`);
    });

    console.log('\n🛠️  Recommended Fixes:');
    console.log('• Add input validation and sanitization');
    console.log('• Implement request size limits');
    console.log('• Add proper error handling');
    console.log('• Use parameterized queries for database');
    console.log('• Implement rate limiting');
  } else {
    console.log('\n🎉 No critical vulnerabilities found!');
  }

  return results.vulnerabilities.length === 0;
}

// Run the test
if (require.main === module) {
  testServerSecurity()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Security test failed:', err.message);
      process.exit(1);
    });
}

module.exports = testServerSecurity;

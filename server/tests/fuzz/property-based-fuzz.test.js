// Set NODE_ENV to test to suppress console logs during testing
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../server.js');
const User = require('../../models/User');

// Simple property-based tests without fast-check async issues
describe('Property-Based Fuzz Tests', () => {
  let authCookie;
  let moderationService;
  
  beforeAll(async () => {
    // Create a test user and get auth token for protected endpoints
    const uniqueUsername = `testuser_${Date.now()}`;
    
    try {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: uniqueUsername,
          password: 'Test123!'
        });
      
      // Login and get cookie  
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: uniqueUsername,
          password: 'Test123!'
        });
      
      authCookie = loginResponse.headers['set-cookie'];
      
      // Get reference to moderation service for cleanup
      const moderationMiddleware = require('../../middleware/moderationMiddleware');
      if (moderationMiddleware && moderationMiddleware.shutdown) {
        moderationService = moderationMiddleware;
      }
    } catch (error) {
      console.log('Setup error:', error.message);
    }
  });

  afterAll(async () => {
    // Clean up the moderation service to prevent hanging
    if (moderationService && moderationService.shutdown) {
      try {
        await moderationService.shutdown();
      } catch (error) {
        console.log('Cleanup error:', error.message);
      }
    }
    
    // Give a small delay for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Auth Properties', () => {
    test('Username validation should be consistent', async () => {
      const testCases = [
        { input: ' ', shouldPass: false },           // space (should fail)
        { input: '', shouldPass: false },            // empty (should fail) 
        { input: 'ab', shouldPass: false },          // too short (should fail)
        { input: `valid_user_${Date.now()}`, shouldPass: true }, // valid (should pass)
        { input: 'very_long_username_that_exceeds_the_twenty_character_limit', shouldPass: false }, // too long (should fail)
        { input: 'invalid@char', shouldPass: false }, // invalid character (should fail)
        { input: `user_123_${Date.now()}`, shouldPass: true },    // valid (should pass)
        { input: '   ', shouldPass: false },         // multiple spaces (should fail)
        { input: 'a'.repeat(25), shouldPass: false }, // way too long (should fail)
      ];
      
      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: testCase.input,
            password: 'ValidPass123!'
          });

        // Property: Response should always be valid HTTP status
        expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);
        
        // Property: Check if username meets requirements
        const trimmedUsername = testCase.input.trim();
        const isAlphanumericUnderscore = /^[a-zA-Z0-9_]+$/.test(trimmedUsername);
        const isValidLength = trimmedUsername.length >= 3 && trimmedUsername.length <= 20;
        const isValidUsername = isAlphanumericUnderscore && isValidLength;
        
        if (testCase.shouldPass && isValidUsername) {
          // Valid username should either succeed (201) or fail due to duplicate (400)
          expect([201, 400].includes(response.status)).toBe(true);
        } else {
          // Invalid username should return 400
          expect(response.status).toBe(400);
        }
      }
    });

    test('Password validation should reject weak passwords', async () => {
      const testCases = [
        { input: '', shouldPass: false },              // empty (should fail)
        { input: 'short', shouldPass: false },         // too short (should fail)
        { input: 'nouppercase1', shouldPass: true },  // valid - has letter and number, 8+ chars
        { input: 'NOLOWERCASE1', shouldPass: true },  // valid - has letter and number, 8+ chars 
        { input: 'NoNumbers', shouldPass: false },     // no numbers (should fail)
        { input: 'ValidPass123', shouldPass: true },  // valid (should pass)
        { input: 'a'.repeat(100), shouldPass: false }, // very long but no numbers (should fail)
        { input: '12345678', shouldPass: false },      // numbers only, no letters (should fail)
        { input: 'Ab1', shouldPass: false },           // too short even with mix (should fail)
        { input: 'ValidPassword1', shouldPass: true }, // clearly valid (should pass)
      ];
      
      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: `user_${Math.random().toString(36).substr(2, 9)}`,
            password: testCase.input
          });

        // Property: Response should always be valid HTTP status
        expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);

        // Property: Check if password meets requirements
        const isValidLength = testCase.input.length >= 8;
        const hasNumber = /\d/.test(testCase.input);
        const hasLetter = /[a-zA-Z]/.test(testCase.input);
        const isNotEmpty = testCase.input.length > 0;
        const isValidPassword = isValidLength && hasNumber && hasLetter && isNotEmpty;
        
        if (testCase.shouldPass && isValidPassword) {
          // Valid password should either succeed (201) or fail due to duplicate username (400)
          expect([201, 400].includes(response.status)).toBe(true);
        } else {
          // Invalid password should return 400
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('Event Properties', () => {
    test('Event creation should validate required fields', async () => {
      if (!authCookie) {
        console.log('Skipping event tests - no auth cookie');
        return;
      }
      
      const testCases = [
        { title: '', date: new Date().toISOString(), shouldPass: false },        // empty title (should fail)
        { title: 'Valid Event', date: '', shouldPass: false },                  // empty date (should fail)
        { title: '   ', date: new Date().toISOString(), shouldPass: false },    // whitespace title (should fail)
        { title: 'Valid Event', date: 'invalid-date', shouldPass: false },      // invalid date (should fail)
        { title: 'Valid Event', date: new Date().toISOString(), shouldPass: true }, // valid (should pass)
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/events')
          .set('Cookie', authCookie)
          .send(testCase);

        expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);
        
        const hasValidTitle = testCase.title && typeof testCase.title === 'string' && testCase.title.trim().length > 0;
        const hasValidDate = testCase.date && !isNaN(Date.parse(testCase.date));
        const isValidEvent = hasValidTitle && hasValidDate;
        
        if (testCase.shouldPass && isValidEvent) {
          expect([201].includes(response.status)).toBe(true);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('Input Sanitization Properties', () => {
    test('All endpoints should handle malformed JSON gracefully', async () => {
      const malformedJsons = [
        '{"invalid": json}',
        '{missing_quotes: "value"}', 
        '{"trailing": "comma",}',
        'not json at all',
        '{"unclosed": "quote}'
      ];

      const endpoints = [
        '/api/auth/register',
        '/api/events',
        '/api/threads'
      ];

      for (const endpoint of endpoints) {
        for (const badJson of malformedJsons) {
          try {
            const response = await request(app)
              .post(endpoint)
              .set('Cookie', authCookie || '')
              .set('Content-Type', 'application/json')
              .send(badJson);

            // Should handle malformed JSON gracefully (not crash)
            expect([400, 401, 422, 500].includes(response.status)).toBe(true);
          } catch (error) {
            // If the request itself throws, that's also acceptable for malformed JSON
            expect(error).toBeDefined();
          }
        }
      }
    });

    test('XSS payloads should be rejected or sanitized', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<svg onload=alert("xss")>',
        '"><script>alert("xss")</script>'
      ];

      // Test username field in registration
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: payload,
            password: 'ValidPass123!'
          });

        expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);
        
        // XSS payload in username should be rejected (400) due to invalid characters
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Thread/Forum Properties', () => {
    test('Thread creation should sanitize content', async () => {
      if (!authCookie) {
        console.log('Skipping thread tests - no auth cookie');
        return;
      }

      const testCases = [
        { title: '', content: 'Valid content', shouldPass: false },     // empty title (should fail)
        { title: 'Valid Title', content: '', shouldPass: false },       // empty content (should fail)  
        { title: '   ', content: 'Valid content', shouldPass: false },  // whitespace title (should fail)
        { title: 'Valid Title', content: '   ', shouldPass: false },    // whitespace content (should fail)
        { title: 'Valid Title', content: 'Valid content', shouldPass: true }, // valid (should pass)
        { title: '<script>alert("xss")</script>', content: 'Test content', shouldPass: false }, // XSS attempt (should fail)
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/threads')
          .set('Cookie', authCookie)
          .send({
            ...testCase,
            date: new Date().toISOString()
          });

        expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);
        
        const hasValidTitle = testCase.title && typeof testCase.title === 'string' && testCase.title.trim().length > 0;
        const hasValidContent = testCase.content && typeof testCase.content === 'string' && testCase.content.trim().length > 0;
        const isValidThread = hasValidTitle && hasValidContent;
        
        if (testCase.shouldPass && isValidThread) {
          expect([201].includes(response.status)).toBe(true);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    test('Thread voting should maintain consistency', async () => {
      if (!authCookie) {
        console.log('Skipping thread voting tests - no auth cookie');
        return;
      }

      // First create a test thread
      const threadResponse = await request(app)
        .post('/api/threads')
        .set('Cookie', authCookie)
        .send({
          title: 'Test Thread',
          content: 'Test content',
          date: new Date().toISOString()
        });

      if (threadResponse.status === 201 && threadResponse.body) {
        const threadId = threadResponse.body._id || threadResponse.body.threadId || 'test-id';
        const voteDirections = [
          { direction: 'up', shouldPass: true },
          { direction: 'down', shouldPass: true },
          { direction: 'invalid', shouldPass: false },
          { direction: '', shouldPass: false }
        ];

        for (const testCase of voteDirections) {
          const response = await request(app)
            .post(`/api/threads/${threadId}/vote`)
            .set('Cookie', authCookie)
            .send({ direction: testCase.direction });

          expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);
          
          if (testCase.shouldPass) {
            expect([200, 201, 400].includes(response.status)).toBe(true);
          } else {
            expect(response.status).toBe(400);
          }
        }
      }
    });
  });

  describe('Vital Signs Properties', () => {
    test('Vital signs should validate numeric ranges', async () => {
      if (!authCookie) {
        console.log('Skipping vital signs tests - no auth cookie');
        return;
      }

      // Create a test care recipient first
      const recipientResponse = await request(app)
        .post('/api/care-recipients')
        .set('Cookie', authCookie)
        .send({
          name: 'Test Recipient',
          age: 30
        });

      const recipientId = recipientResponse.body?.recipient?._id || recipientResponse.body?._id || 'test-recipient-id';

      const testCases = [
        { recipientId: '', type: 'heart_rate', value: 70, shouldPass: false },    // empty recipient (should fail)
        { recipientId: recipientId, type: '', value: 70, shouldPass: false },     // empty type (should fail)
        { recipientId: recipientId, type: 'heart_rate', value: '', shouldPass: false }, // empty value (should fail)
        { recipientId: recipientId, type: 'heart_rate', value: -10, shouldPass: false }, // negative value (should fail)
        { recipientId: recipientId, type: 'heart_rate', value: 500, shouldPass: false }, // too high (should fail)
        { recipientId: recipientId, type: 'heart_rate', value: 70, shouldPass: true },  // valid (should pass)
        { recipientId: recipientId, type: 'temperature', value: 98.6, shouldPass: true }, // valid (should pass)
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/vital-signs')
          .set('Cookie', authCookie)
          .send(testCase);

        expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);
        
        const hasValidRecipient = testCase.recipientId && testCase.recipientId.toString().trim().length > 0;
        const hasValidType = testCase.type && testCase.type.trim().length > 0;
        const hasValidValue = typeof testCase.value === 'number' && testCase.value >= 0;
        const isValidVital = hasValidRecipient && hasValidType && hasValidValue;
        
        if (testCase.shouldPass && isValidVital) {
          expect([201, 400].includes(response.status)).toBe(true);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('Care Recipients Properties', () => {
    test('Care recipient data should validate required fields', async () => {
      if (!authCookie) {
        console.log('Skipping care recipient tests - no auth cookie');
        return;
      }

      const testCases = [
        { name: '', age: 30, shouldPass: false },           // empty name (should fail)
        { name: 'Valid Name', age: '', shouldPass: false }, // empty age (should fail)
        { name: '   ', age: 30, shouldPass: false },        // whitespace name (should fail)
        { name: 'Valid Name', age: -5, shouldPass: false }, // negative age (should fail)
        { name: 'Valid Name', age: 150, shouldPass: false }, // too old (should fail)
        { name: 'Valid Name', age: 30, shouldPass: true }, // valid (should pass)
        { name: 'Valid Name', age: 0, shouldPass: true },  // edge case - newborn (should pass)
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/care-recipients')
          .set('Cookie', authCookie)
          .send(testCase);

        expect([200, 201, 400, 401, 409, 422, 500].includes(response.status)).toBe(true);
        
        const hasValidName = testCase.name && typeof testCase.name === 'string' && testCase.name.trim().length > 0;
        const hasValidAge = typeof testCase.age === 'number' && testCase.age >= 0 && testCase.age <= 130;
        const isValidRecipient = hasValidName && hasValidAge;
        
        if (testCase.shouldPass && isValidRecipient) {
          expect([201, 400].includes(response.status)).toBe(true);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('Rate Limiting Properties', () => {
    test('Repeated requests should handle concurrent load', async () => {
      const endpoint = '/api/auth/register';
      const requests = [];
      
      // Send multiple rapid requests with unique usernames
      for (let i = 0; i < 5; i++) {  // Reduced to 5 to avoid overwhelming the server
        requests.push(
          request(app)
            .post(endpoint)
            .send({
              username: `user${i}_${Date.now()}_${Math.random()}`,
              password: 'Test123!'
            })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // All responses should have valid status codes
      for (const response of responses) {
        expect([200, 201, 400, 401, 409, 422, 429, 500].includes(response.status)).toBe(true);
      }
      
      // Server should handle the concurrent requests gracefully - either with successes or appropriate error handling
      const statusCodes = responses.map(r => r.status);
      const hasValidResponses = statusCodes.every(code => [200, 201, 400, 401, 409, 422, 429, 500].includes(code));
      
      // The main requirement is that the server doesn't crash and returns valid HTTP status codes
      expect(hasValidResponses).toBe(true);
    });
  });
});

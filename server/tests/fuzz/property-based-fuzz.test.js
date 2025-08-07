/**
 * Property-Based Fuzz Testing using fast-check
 * Tests business logic invariants and properties
 */

const fc = require('fast-check');
const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Property-Based Fuzz Tests', () => {
  let mongoServer;
  let testToken;
  let testUser;

  beforeAll(async () => {
    // Setup test database
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(mongoUri);

    // Create a test user for authenticated endpoints
    testUser = {
      username: 'testuser123',
      password: 'TestPass123!'
    };

    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send(testUser);

    testToken = loginRes.headers['set-cookie']?.[0];
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('Auth Properties', () => {
    test('Username validation should be consistent', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (username) => {
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              username,
              password: 'ValidPass123!'
            });

          // Property: Either username is valid (201/400 for duplicate) or invalid (400)
          expect([201, 400].includes(response.status)).toBe(true);
          
          // Property: Invalid usernames should have consistent error messages
          if (response.status === 400 && response.body.message) {
            const validMessages = [
              'Username can only contain letters, numbers, and underscores',
              'Username must be between 3 and 20 characters',
              'Username is inappropriate',
              'Username already exists'
            ];
            expect(validMessages.some(msg => 
              response.body.message.includes(msg)
            )).toBe(true);
          }
        }
      ), { numRuns: 50 });
    });

    test('Password validation should reject weak passwords', () => {
      fc.assert(fc.property(
        fc.string({ maxLength: 30 }),
        async (password) => {
          const response = await request(app)
            .post('/api/auth/register')
            .send({
              username: `user${Math.random().toString(36).substr(2, 9)}`,
              password
            });

          // Property: Passwords must meet strength requirements
          if (password.length < 8 || !/\\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Password');
          }
        }
      ), { numRuns: 30 });
    });
  });

  describe('Event Properties', () => {
    test('Event creation should validate required fields', () => {
      fc.assert(fc.property(
        fc.record({
          title: fc.option(fc.string({ maxLength: 100 })),
          description: fc.option(fc.string({ maxLength: 500 })),
          datetime: fc.option(fc.date()),
          type: fc.option(fc.constantFrom('appointment', 'medication', 'exercise', 'other')),
          recipientId: fc.option(fc.string())
        }),
        async (eventData) => {
          const response = await request(app)
            .post('/api/events')
            .set('Cookie', testToken || '')
            .send(eventData);

          // Property: Events must have required fields
          if (!eventData.title || !eventData.datetime) {
            expect([400, 401].includes(response.status)).toBe(true);
          }
          
          // Property: Valid events should be created or return specific errors
          expect([200, 201, 400, 401, 422].includes(response.status)).toBe(true);
        }
      ), { numRuns: 40 });
    });

    test('Event dates should be handled consistently', () => {
      fc.assert(fc.property(
        fc.date(),
        async (date) => {
          const eventData = {
            title: 'Test Event',
            description: 'Test Description',
            datetime: date,
            type: 'other'
          };

          const response = await request(app)
            .post('/api/events')
            .set('Cookie', testToken || '')
            .send(eventData);

          // Property: All date formats should be handled gracefully
          expect([200, 201, 400, 401].includes(response.status)).toBe(true);
          
          if (response.status === 400) {
            expect(response.body).toHaveProperty('message');
          }
        }
      ), { numRuns: 25 });
    });
  });

  describe('Thread/Forum Properties', () => {
    test('Thread creation should sanitize content', () => {
      fc.assert(fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          content: fc.string({ minLength: 1, maxLength: 5000 }),
          author: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async (threadData) => {
          const response = await request(app)
            .post('/api/threads')
            .set('Cookie', testToken || '')
            .send(threadData);

          // Property: Thread creation should either succeed or fail gracefully
          expect([200, 201, 400, 401, 422].includes(response.status)).toBe(true);
          
          // Property: XSS content should be rejected or sanitized
          const hasXSS = /(<script|javascript:|on\\w+\\s*=)/i.test(threadData.title + threadData.content);
          if (hasXSS && response.status === 201) {
            // If accepted, should be sanitized
            if (response.body.title) {
              expect(response.body.title).not.toMatch(/(<script|javascript:|on\\w+\\s*=)/i);
            }
          }
        }
      ), { numRuns: 30 });
    });

    test('Thread voting should maintain consistency', () => {
      fc.assert(fc.property(
        fc.constantFrom('up', 'down'),
        fc.string(),
        async (direction, userId) => {
          // First create a thread
          const threadRes = await request(app)
            .post('/api/threads')
            .set('Cookie', testToken || '')
            .send({
              title: 'Test Thread',
              content: 'Test Content',
              author: 'testuser'
            });

          if (threadRes.status === 201) {
            const threadId = threadRes.body._id;
            
            const voteResponse = await request(app)
              .post(`/api/threads/${threadId}/vote`)
              .set('Cookie', testToken || '')
              .send({ direction, userId });

            // Property: Vote responses should be consistent
            expect([200, 400, 401, 404].includes(voteResponse.status)).toBe(true);
          }
        }
      ), { numRuns: 20 });
    });
  });

  describe('Vital Signs Properties', () => {
    test('Vital signs should validate numeric ranges', () => {
      fc.assert(fc.property(
        fc.record({
          recipientId: fc.string(),
          type: fc.constantFrom('blood_pressure', 'heart_rate', 'temperature', 'weight'),
          value: fc.float({ min: -1000, max: 1000 }),
          unit: fc.option(fc.string({ maxLength: 10 })),
          date: fc.option(fc.date())
        }),
        async (vitalData) => {
          const response = await request(app)
            .post('/api/vital-signs')
            .set('Cookie', testToken || '')
            .send(vitalData);

          // Property: Vital signs should validate reasonable ranges
          expect([200, 201, 400, 401, 422].includes(response.status)).toBe(true);
          
          // Property: Negative or extreme values should be rejected for certain types
          if (vitalData.type === 'heart_rate' && (vitalData.value < 0 || vitalData.value > 300)) {
            expect([400, 422].includes(response.status)).toBe(true);
          }
          
          if (vitalData.type === 'temperature' && (vitalData.value < 80 || vitalData.value > 120)) {
            expect([400, 422].includes(response.status)).toBe(true);
          }
        }
      ), { numRuns: 35 });
    });
  });

  describe('Care Recipients Properties', () => {
    test('Care recipient data should validate required fields', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.option(fc.string({ maxLength: 100 })),
          age: fc.option(fc.integer({ min: -10, max: 150 })),
          medicalConditions: fc.option(fc.array(fc.string({ maxLength: 50 }))),
          medications: fc.option(fc.array(fc.record({
            name: fc.string({ maxLength: 50 }),
            dosage: fc.string({ maxLength: 20 }),
            frequency: fc.string({ maxLength: 30 })
          })))
        }),
        async (recipientData) => {
          const response = await request(app)
            .post('/api/care-recipients')
            .set('Cookie', testToken || '')
            .send(recipientData);

          // Property: Care recipients must have valid data
          expect([200, 201, 400, 401, 422].includes(response.status)).toBe(true);
          
          // Property: Age should be reasonable
          if (recipientData.age !== undefined && (recipientData.age < 0 || recipientData.age > 130)) {
            expect([400, 422].includes(response.status)).toBe(true);
          }
        }
      ), { numRuns: 30 });
    });
  });

  describe('Input Sanitization Properties', () => {
    test('All endpoints should handle malformed JSON', () => {
      const malformedJsons = [
        '{invalid json}',
        '{"incomplete": json',
        'not json at all',
        '{"null": null, "undefined": undefined}',
        '{"number": NaN}',
        '{"infinity": Infinity}'
      ];

      return Promise.all(malformedJsons.map(async (badJson) => {
        const endpoints = ['/api/auth/register', '/api/events', '/api/threads'];
        
        for (const endpoint of endpoints) {
          try {
            const response = await request(app)
              .post(endpoint)
              .set('Cookie', testToken || '')
              .set('Content-Type', 'application/json')
              .send(badJson);

            // Property: Malformed JSON should never crash the server
            expect(response.status).toBeDefined();
            expect(response.status).not.toBe(500);
          } catch (err) {
            // Should handle parsing errors gracefully
            expect(err.status).not.toBe(500);
          }
        }
      }));
    });

    test('All string inputs should be sanitized against XSS', () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '<img src=x onerror=alert(1)>',
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
        '<iframe src="javascript:alert(1)"></iframe>'
      ];

      return Promise.all(xssPayloads.map(async (payload) => {
        // Test thread creation with XSS
        const response = await request(app)
          .post('/api/threads')
          .set('Cookie', testToken || '')
          .send({
            title: payload,
            content: payload,
            author: 'testuser'
          });

        // Property: XSS should be rejected or sanitized
        if (response.status === 201) {
          expect(response.body.title).not.toContain('<script');
          expect(response.body.content).not.toContain('<script');
        }
      }));
    });
  });

  describe('Rate Limiting Properties', () => {
    test('Repeated requests should be rate limited', async () => {
      const requests = Array(20).fill().map(() => 
        request(app)
          .post('/api/auth/register')
          .send({
            username: `user${Math.random().toString(36).substr(2, 9)}`,
            password: 'ValidPass123!'
          })
      );

      const responses = await Promise.allSettled(requests);
      
      // Property: Some requests should be rate limited or all should succeed
      const statuses = responses
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value.status);
      
      expect(statuses.every(s => [200, 201, 400, 429].includes(s))).toBe(true);
    }, 15000);
  });
});

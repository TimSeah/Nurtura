/**
 * Basic Fuzz Test - Simple version to test setup
 */

const request = require('supertest');

// Mock the server for testing
const express = require('express');
const testApp = express();

testApp.use(express.json());
testApp.get('/health', (req, res) => res.json({ status: 'OK' }));
testApp.post('/test', (req, res) => res.json({ received: req.body }));

describe('Basic Fuzz Test Setup', () => {
  test('Should handle normal requests', async () => {
    const response = await request(testApp)
      .get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('Should handle malformed JSON', async () => {
    const response = await request(testApp)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send('invalid json');
    
    // Should not crash (status 200 or 400 is acceptable)
    expect([200, 400].includes(response.status)).toBe(true);
  });

  test('Should handle XSS attempts', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(testApp)
      .post('/test')
      .send({ data: xssPayload });
    
    expect(response.status).toBe(200);
    expect(response.body.received.data).toBe(xssPayload);
  });
});

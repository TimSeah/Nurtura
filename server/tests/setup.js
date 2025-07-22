// Test setup file for Jest
const { MongoMemoryServer } = require('mongodb-memory-server');

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.GMAIL_USER = 'test@example.com';
  process.env.GMAIL_APP_PASSWORD = 'test_password';
  process.env.EMAIL_FROM_NAME = 'Test Nurtura';
});

afterAll(async () => {
  // Clean up test environment
  delete process.env.NODE_ENV;
  delete process.env.GMAIL_USER;
  delete process.env.GMAIL_APP_PASSWORD;
  delete process.env.EMAIL_FROM_NAME;
});

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment to silence console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

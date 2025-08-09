/**
 * Jest Configuration for Fuzz Testing
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/fuzz/**/*.test.js'
  ],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage/fuzz',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globalTeardown: '<rootDir>/tests/fuzz/teardown.js'
};

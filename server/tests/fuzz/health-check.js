/**
 * Health Check for Fuzz Testing
 * Verifies server is ready for testing
 */

const request = require('supertest');

async function healthCheck(app) {
  try {
    const response = await request(app).get('/health');
    
    if (response.status === 200) {
      console.log('✅ Server health check passed');
      return true;
    } else {
      console.log('❌ Server health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server health check error:', error.message);
    return false;
  }
}

module.exports = { healthCheck };

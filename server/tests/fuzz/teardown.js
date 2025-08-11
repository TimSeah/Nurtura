/**
 * Global teardown for fuzz tests
 */

const mongoose = require('mongoose');

module.exports = async () => {
  // Close any remaining database connections
  await mongoose.disconnect();
  
  console.log('Fuzz test teardown complete');
};

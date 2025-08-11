const fetch = require('node-fetch');

async function debugJWT() {
  try {
    console.log('Creating user and testing JWT...');
    
    // Register
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: 'debuguser2', password: 'debugpass123'})
    });

    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: 'debuguser2', password: 'debugpass123'})
    });
    
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Full cookie string:', cookies);

    // Extract just the token value
    const tokenMatch = cookies.match(/token=([^;]+)/);
    if (tokenMatch) {
      const tokenValue = tokenMatch[1];
      console.log('Extracted token:', tokenValue);

      // Test direct token verification
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        console.log('Token verification successful:', decoded);
      } catch (err) {
        console.log('Token verification failed:', err.message);
      }
    }

    // Now test the /me endpoint
    console.log('\nTesting /me endpoint...');
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('Response status:', meRes.status);
    const responseText = await meRes.text();
    console.log('Response body:', responseText);

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugJWT();

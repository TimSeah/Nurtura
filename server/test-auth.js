const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('1. Testing registration...');
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: 'debuguser', password: 'debugpass123'})
    });
    const registerData = await registerRes.json();
    console.log('Register response:', registerData);

    console.log('\n2. Testing login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: 'debuguser', password: 'debugpass123'})
    });
    
    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
    console.log('Login headers:', Object.fromEntries([...loginRes.headers.entries()]));

    // Extract cookies from login response
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie header:', cookies);

    if (!cookies) {
      console.error('No cookies set during login!');
      return;
    }

    console.log('\n3. Testing /me with cookie...');
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    const meData = await meRes.json();
    console.log('Me response status:', meRes.status);
    console.log('Me response data:', meData);
    console.log('Me response headers:', Object.fromEntries([...meRes.headers.entries()]));

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();

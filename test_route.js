// Test the test route with auth
import fetch from 'node-fetch';

async function testWithAuth() {
    const baseUrl = 'http://localhost:5000/api';
    
    // Login first
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'debuguser',
            password: 'debugpass123'
        })
    });
    
    const cookies = loginResponse.headers.raw()['set-cookie'];
    const authCookie = cookies.find(cookie => cookie.startsWith('token='));
    
    // Test the test route
    const testResponse = await fetch(`${baseUrl}/threads/test`, {
        method: 'GET',
        headers: {
            'Cookie': authCookie
        }
    });
    
    console.log('Test route status:', testResponse.status);
    console.log('Test route response:', await testResponse.text());
}

testWithAuth().catch(console.error);

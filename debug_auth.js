// Simple debug test for API
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000/api';

async function testAuth() {
    console.log('🔐 Testing authentication flow...');
    
    // Step 1: Test registration
    console.log('\n1️⃣ Testing user registration...');
    try {
        const regResponse = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'debuguser',
                password: 'debugpass123'
            })
        });
        
        console.log('Registration Status:', regResponse.status);
        const regText = await regResponse.text();
        console.log('Registration Response:', regText);
    } catch (error) {
        console.log('Registration Error:', error.message);
    }
    
    // Step 2: Test login
    console.log('\n2️⃣ Testing user login...');
    let authCookie = '';
    try {
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
        
        console.log('Login Status:', loginResponse.status);
        const loginText = await loginResponse.text();
        console.log('Login Response:', loginText);
        
        // Extract cookies
        const cookies = loginResponse.headers.raw()['set-cookie'];
        if (cookies) {
            authCookie = cookies.find(cookie => cookie.startsWith('token='));
            console.log('Auth Cookie:', authCookie ? 'Found' : 'Not found');
        }
    } catch (error) {
        console.log('Login Error:', error.message);
    }
    
    // Step 3: Test auth/me endpoint
    console.log('\n3️⃣ Testing auth verification...');
    try {
        const meResponse = await fetch(`${baseUrl}/auth/me`, {
            method: 'GET',
            headers: {
                'Cookie': authCookie
            }
        });
        
        console.log('Auth/me Status:', meResponse.status);
        const meText = await meResponse.text();
        console.log('Auth/me Response:', meText);
    } catch (error) {
        console.log('Auth/me Error:', error.message);
    }
    
    // Step 4: Test simple thread creation with minimal data
    console.log('\n4️⃣ Testing thread creation...');
    try {
        const threadResponse = await fetch(`${baseUrl}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            body: JSON.stringify({
                title: 'Debug test',
                content: 'Just testing'
            })
        });
        
        console.log('Thread Creation Status:', threadResponse.status);
        const threadText = await threadResponse.text();
        console.log('Thread Creation Response:', threadText);
    } catch (error) {
        console.log('Thread Creation Error:', error.message);
    }
    
    console.log('\n✅ Debug test completed!');
}

testAuth().catch(console.error);

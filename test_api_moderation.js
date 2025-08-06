// Test script to verify API moderation is working
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000/api';
let authCookie = '';

async function createTestUser() {
    console.log('🔧 Creating test user...');
    
    try {
        const response = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser123',
                password: 'testpass123'
            })
        });
        
        if (response.ok) {
            console.log('✅ Test user created successfully');
            return true;
        } else {
            const error = await response.text();
            console.log('ℹ️  User might already exist:', error);
            return true; // Continue anyway
        }
    } catch (error) {
        console.log('❌ Failed to create test user:', error.message);
        return false;
    }
}

async function loginTestUser() {
    console.log('🔑 Logging in test user...');
    
    try {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser123',
                password: 'testpass123'
            })
        });
        
        if (response.ok) {
            // Extract cookies from response
            const cookies = response.headers.raw()['set-cookie'];
            if (cookies) {
                authCookie = cookies.find(cookie => cookie.startsWith('token='));
                console.log('✅ Login successful, got auth cookie');
                return true;
            }
        }
        
        console.log('❌ Login failed');
        return false;
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return false;
    }
}

async function testThreadModeration() {
    console.log('\n🧪 Testing Thread Moderation...');
    
    // Test 1: Clean content (should be allowed)
    try {
        const cleanResponse = await fetch(`${baseUrl}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            body: JSON.stringify({
                title: 'Welcome to our community',
                content: 'This is a friendly post about helping each other.'
            })
        });
        
        const cleanResult = await cleanResponse.text();
        console.log('✅ Clean content test:');
        console.log(`Status: ${cleanResponse.status}`);
        console.log(`Response: ${cleanResult.substring(0, 200)}...`);
    } catch (error) {
        console.log('❌ Clean content test failed:', error.message);
    }
    
    // Test 2: Inappropriate content (should be blocked)
    try {
        const toxicResponse = await fetch(`${baseUrl}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            body: JSON.stringify({
                title: 'Toxic post',
                content: 'You are all stupid idiots and should go kill yourselves'
            })
        });
        
        const toxicResult = await toxicResponse.text();
        console.log('\n🚫 Toxic content test:');
        console.log(`Status: ${toxicResponse.status}`);
        console.log(`Response: ${toxicResult}`);
    } catch (error) {
        console.log('❌ Toxic content test failed:', error.message);
    }
}

async function testCommentModeration() {
    console.log('\n🧪 Testing Comment Moderation...');
    
    // First create a thread to comment on
    try {
        const threadResponse = await fetch(`${baseUrl}/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            body: JSON.stringify({
                title: 'Test thread for comments',
                content: 'This is a test thread.'
            })
        });
        
        if (threadResponse.ok) {
            const thread = await threadResponse.json();
            console.log(`✅ Created test thread: ${thread._id}`);
            
            // Test inappropriate comment
            const commentResponse = await fetch(`${baseUrl}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authCookie
                },
                body: JSON.stringify({
                    threadId: thread._id,
                    content: 'This is hate speech and very inappropriate content',
                    author: 'testuser123'
                })
            });
            
            const commentResult = await commentResponse.text();
            console.log('\n🚫 Inappropriate comment test:');
            console.log(`Status: ${commentResponse.status}`);
            console.log(`Response: ${commentResult}`);
        }
    } catch (error) {
        console.log('❌ Comment moderation test failed:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting API Moderation Tests...');
    console.log('Make sure the server is running on http://localhost:5000');
    
    // Setup authentication
    const userCreated = await createTestUser();
    if (!userCreated) {
        console.log('❌ Cannot proceed without test user');
        return;
    }
    
    const loggedIn = await loginTestUser();
    if (!loggedIn) {
        console.log('❌ Cannot proceed without authentication');
        return;
    }
    
    await testThreadModeration();
    await testCommentModeration();
    
    console.log('\n✅ Tests completed!');
}

// Only run if called directly
runTests().catch(console.error);

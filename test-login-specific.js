const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function testLoginSpecific() {
    console.log('🔐 TESTING LOGIN ENDPOINT SPECIFICALLY\n');
    
    // Test 1: Check if auth route exists
    console.log('1. Testing auth route availability...');
    try {
        const response = await axios.get(`${BASE_URL}/auth`, {
            validateStatus: () => true
        });
        console.log(`   Auth route status: ${response.status}`);
    } catch (error) {
        console.log(`   Auth route error: ${error.message}`);
    }
    
    // Test 2: Test login with correct credentials
    console.log('\n2. Testing login with admin credentials...');
    try {
        const loginData = {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        };
        
        console.log(`   Sending: ${JSON.stringify(loginData)}`);
        
        const response = await axios.post(`${BASE_URL}/auth/login`, loginData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
        
        if (response.status === 200 && response.data.success) {
            console.log('   ✅ Login successful!');
            console.log(`   Token: ${response.data.data.token?.substring(0, 20)}...`);
            console.log(`   User: ${response.data.data.user.email} (${response.data.data.user.role})`);
        } else {
            console.log('   ❌ Login failed');
        }
        
    } catch (error) {
        console.log(`   ❌ Login error: ${error.message}`);
        if (error.response) {
            console.log(`   Response status: ${error.response.status}`);
            console.log(`   Response data: ${JSON.stringify(error.response.data)}`);
        }
    }
    
    // Test 3: Test with wrong credentials
    console.log('\n3. Testing login with wrong credentials...');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'wrongpassword'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: () => true
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
        
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }
    
    // Test 4: Check if user exists in database
    console.log('\n4. Testing user existence via auth/me (should fail without token)...');
    try {
        const response = await axios.get(`${BASE_URL}/auth/me`, {
            validateStatus: () => true
        });
        console.log(`   Status: ${response.status} (expected 401)`);
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }
}

testLoginSpecific().catch(console.error);
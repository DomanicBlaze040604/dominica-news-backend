const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function debugLoginError() {
    console.log('🔍 DEBUGGING LOGIN ERROR: "this.set is not a function"\n');
    
    // Test 1: Simple login request with detailed error logging
    console.log('1. Testing login with detailed error capture...');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Debug-Client/1.0'
            },
            timeout: 30000,
            validateStatus: () => true, // Don't throw on any status
            maxRedirects: 0 // Don't follow redirects
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Headers: ${JSON.stringify(response.headers, null, 2)}`);
        console.log(`   Data: ${JSON.stringify(response.data, null, 2)}`);
        
        if (response.status === 200) {
            console.log('   ✅ Login successful!');
        } else {
            console.log('   ❌ Login failed');
        }
        
    } catch (error) {
        console.log('   ❌ Request failed');
        console.log(`   Error: ${error.message}`);
        
        if (error.response) {
            console.log(`   Response Status: ${error.response.status}`);
            console.log(`   Response Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
            console.log(`   Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        
        if (error.request) {
            console.log('   Request was made but no response received');
        }
    }
    
    // Test 2: Check if the auth route is accessible
    console.log('\n2. Testing auth route accessibility...');
    try {
        const response = await axios.options(`${BASE_URL}/auth/login`, {
            headers: {
                'Origin': 'https://www.dominicanews.dm',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            validateStatus: () => true
        });
        
        console.log(`   OPTIONS Status: ${response.status}`);
        console.log(`   CORS Headers: ${JSON.stringify({
            'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
            'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
            'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
        }, null, 2)}`);
        
    } catch (error) {
        console.log(`   OPTIONS Error: ${error.message}`);
    }
    
    // Test 3: Test with minimal payload
    console.log('\n3. Testing with minimal payload...');
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@test.com',
            password: 'wrongpassword'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
            validateStatus: () => true
        });
        
        console.log(`   Minimal test status: ${response.status}`);
        console.log(`   Should be 401 for wrong credentials: ${response.status === 401 ? '✅' : '❌'}`);
        
    } catch (error) {
        console.log(`   Minimal test error: ${error.message}`);
    }
    
    // Test 4: Check server health
    console.log('\n4. Checking server health...');
    try {
        const response = await axios.get(`${BASE_URL}/health`, {
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log(`   Health status: ${response.status}`);
        if (response.status === 200) {
            console.log('   ✅ Server is healthy');
        } else {
            console.log('   ❌ Server health issues');
        }
        
    } catch (error) {
        console.log(`   Health check error: ${error.message}`);
    }
}

debugLoginError().catch(console.error);
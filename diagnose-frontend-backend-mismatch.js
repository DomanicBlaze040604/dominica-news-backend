const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function diagnoseFrontendBackendMismatch() {
    console.log('🔍 DIAGNOSING FRONTEND-BACKEND ENDPOINT MISMATCH\n');
    
    // Test the endpoints that are failing
    const failingEndpoints = [
        '/pages?isPublished=true&showInFooter=true',
        '/static-pages?isPublished=true&showInFooter=true',
        '/auth/login',
        '/articles/dominican-athletes-commonwealth-games-preparation/views',
        '/categories/weather/articles?limit=20&status=published'
    ];
    
    for (const endpoint of failingEndpoints) {
        try {
            console.log(`Testing: ${endpoint}`);
            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                timeout: 5000,
                validateStatus: () => true // Don't throw on 4xx/5xx
            });
            
            console.log(`✅ Status: ${response.status}`);
            if (response.status === 200) {
                console.log(`✅ Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
            } else {
                console.log(`❌ Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ Network Error: ${error.message}`);
        }
        console.log('---');
    }
    
    // Test login with correct credentials
    console.log('\n🔐 TESTING LOGIN WITH ADMIN CREDENTIALS');
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        }, {
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log(`Login Status: ${loginResponse.status}`);
        if (loginResponse.status === 200) {
            console.log('✅ Login successful');
            console.log(`Token: ${loginResponse.data.token?.substring(0, 20)}...`);
        } else {
            console.log('❌ Login failed');
            console.log(`Error: ${JSON.stringify(loginResponse.data)}`);
        }
    } catch (error) {
        console.log(`❌ Login Network Error: ${error.message}`);
    }
    
    // Check if server is running
    console.log('\n🏥 HEALTH CHECK');
    try {
        const healthResponse = await axios.get(`${BASE_URL}/health`, {
            timeout: 5000,
            validateStatus: () => true
        });
        console.log(`Health Status: ${healthResponse.status}`);
        if (healthResponse.status === 200) {
            console.log('✅ Server is healthy');
            console.log(`Response: ${JSON.stringify(healthResponse.data)}`);
        }
    } catch (error) {
        console.log(`❌ Health Check Failed: ${error.message}`);
    }
}

diagnoseFrontendBackendMismatch().catch(console.error);
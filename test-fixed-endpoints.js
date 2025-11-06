const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function testFixedEndpoints() {
    console.log('🔧 TESTING FIXED ENDPOINTS\n');
    
    const endpointsToTest = [
        {
            name: 'Pages endpoint (new alias)',
            url: '/pages?isPublished=true&showInFooter=true',
            expectedStatus: 200
        },
        {
            name: 'Static pages endpoint (original)',
            url: '/static-pages?isPublished=true&showInFooter=true',
            expectedStatus: 200
        },
        {
            name: 'Auth login endpoint',
            url: '/auth/login',
            method: 'POST',
            data: { email: 'admin@dominicanews.com', password: 'Pass@12345' },
            expectedStatus: 200
        },
        {
            name: 'Category articles endpoint',
            url: '/categories/politics/articles?limit=20&status=published',
            expectedStatus: 200
        },
        {
            name: 'Article view tracking',
            url: '/articles/dominican-athletes-commonwealth-games-preparation/views',
            method: 'POST',
            expectedStatus: 200
        }
    ];
    
    for (const test of endpointsToTest) {
        console.log(`Testing: ${test.name}`);
        console.log(`URL: ${BASE_URL}${test.url}`);
        
        try {
            let response;
            if (test.method === 'POST') {
                response = await axios.post(`${BASE_URL}${test.url}`, test.data || {}, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000,
                    validateStatus: () => true
                });
            } else {
                response = await axios.get(`${BASE_URL}${test.url}`, {
                    timeout: 10000,
                    validateStatus: () => true
                });
            }
            
            console.log(`Status: ${response.status} (expected: ${test.expectedStatus})`);
            
            if (response.status === test.expectedStatus) {
                console.log('✅ SUCCESS');
                if (response.data && response.data.data) {
                    if (Array.isArray(response.data.data)) {
                        console.log(`   Data count: ${response.data.data.length} items`);
                    } else if (response.data.data.token) {
                        console.log(`   Token received: ${response.data.data.token.substring(0, 20)}...`);
                    }
                }
            } else {
                console.log('❌ FAILED');
                console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
            }
            
        } catch (error) {
            console.log('❌ ERROR');
            console.log(`   Error: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
            }
        }
        
        console.log('---\n');
    }
    
    // Test CORS headers
    console.log('🌍 TESTING CORS HEADERS');
    try {
        const response = await axios.options(`${BASE_URL}/pages`, {
            headers: {
                'Origin': 'https://www.dominicanews.dm',
                'Access-Control-Request-Method': 'GET'
            },
            validateStatus: () => true
        });
        
        console.log(`CORS Status: ${response.status}`);
        console.log(`Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
        console.log(`Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
        
    } catch (error) {
        console.log(`CORS Error: ${error.message}`);
    }
}

testFixedEndpoints().catch(console.error);
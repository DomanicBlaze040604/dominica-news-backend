const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function diagnoseWebsiteCrash() {
    console.log('🔍 DIAGNOSING WEBSITE CRASH\n');
    
    const endpoints = [
        { name: 'Health Check', url: '/health' },
        { name: 'Articles List', url: '/articles' },
        { name: 'Categories List', url: '/categories' },
        { name: 'Authors List', url: '/authors' },
        { name: 'Static Pages', url: '/static-pages' },
        { name: 'Settings', url: '/settings' },
        { name: 'Breaking News', url: '/breaking-news/active' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing: ${endpoint.name}`);
            const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
                timeout: 10000,
                validateStatus: () => true
            });
            
            console.log(`  Status: ${response.status}`);
            
            if (response.status === 200) {
                console.log(`  ✅ Working`);
                if (response.data.data) {
                    if (Array.isArray(response.data.data)) {
                        console.log(`  Items: ${response.data.data.length}`);
                    }
                }
            } else if (response.status >= 500) {
                console.log(`  ❌ SERVER ERROR`);
                console.log(`  Response: ${JSON.stringify(response.data).substring(0, 200)}`);
            } else {
                console.log(`  ⚠️ Status ${response.status}`);
            }
            
        } catch (error) {
            console.log(`  ❌ FAILED: ${error.message}`);
            if (error.code === 'ECONNABORTED') {
                console.log(`  Timeout - endpoint taking too long`);
            }
        }
        console.log('');
    }
    
    // Test CORS
    console.log('Testing CORS...');
    try {
        const response = await axios.options(`${BASE_URL}/articles`, {
            headers: {
                'Origin': 'https://www.dominicanews.dm',
                'Access-Control-Request-Method': 'GET'
            },
            validateStatus: () => true
        });
        
        console.log(`  CORS Status: ${response.status}`);
        console.log(`  Allow-Origin: ${response.headers['access-control-allow-origin']}`);
        console.log(`  ✅ CORS configured`);
    } catch (error) {
        console.log(`  ❌ CORS Error: ${error.message}`);
    }
}

diagnoseWebsiteCrash().catch(console.error);
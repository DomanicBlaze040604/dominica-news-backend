const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function testFinalEndpoints() {
    console.log('🎯 FINAL ENDPOINT TESTING\n');
    
    // Test all the problematic endpoints from the original error
    const tests = [
        {
            name: 'Pages endpoint (frontend compatibility)',
            url: '/pages?isPublished=true&showInFooter=true',
            expected: 200
        },
        {
            name: 'Auth login',
            url: '/auth/login',
            method: 'POST',
            data: { email: 'admin@dominicanews.com', password: 'Pass@12345' },
            expected: 200
        },
        {
            name: 'Article view tracking',
            url: '/articles/dominican-athletes-commonwealth-games-preparation/views',
            method: 'POST',
            expected: 200
        },
        {
            name: 'Category articles (weather)',
            url: '/categories/weather/articles?limit=20&status=published',
            expected: 200
        },
        {
            name: 'Health check',
            url: '/health',
            expected: 200
        }
    ];
    
    for (const test of tests) {
        console.log(`Testing: ${test.name}`);
        console.log(`URL: ${BASE_URL}${test.url}`);
        
        try {
            let response;
            if (test.method === 'POST') {
                response = await axios.post(`${BASE_URL}${test.url}`, test.data || {}, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000,
                    validateStatus: () => true
                });
            } else {
                response = await axios.get(`${BASE_URL}${test.url}`, {
                    timeout: 15000,
                    validateStatus: () => true
                });
            }
            
            console.log(`Status: ${response.status} (expected: ${test.expected})`);
            
            if (response.status === test.expected) {
                console.log('✅ SUCCESS');
                
                if (response.data && response.data.success) {
                    if (response.data.data) {
                        if (Array.isArray(response.data.data)) {
                            console.log(`   Items: ${response.data.data.length}`);
                        } else if (response.data.data.token) {
                            console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
                        } else if (response.data.data.articles) {
                            console.log(`   Articles: ${response.data.data.articles.length}`);
                        }
                    }
                }
            } else {
                console.log('❌ FAILED');
                if (response.status >= 500) {
                    console.log('   Server Error - Check deployment logs');
                } else {
                    console.log(`   Response: ${JSON.stringify(response.data).substring(0, 150)}...`);
                }
            }
            
        } catch (error) {
            console.log('❌ ERROR');
            console.log(`   ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
            }
        }
        
        console.log('---\n');
    }
    
    console.log('🎉 SUMMARY');
    console.log('If all tests show ✅ SUCCESS, then all the frontend issues should be resolved!');
}

testFinalEndpoints().catch(console.error);
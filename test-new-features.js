const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function testNewFeatures() {
    console.log('🧪 TESTING NEW ADMIN FEATURES\n');
    
    // Login first
    console.log('1. Logging in as admin...');
    let adminToken;
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        });
        
        adminToken = loginResponse.data.data.token;
        console.log('✅ Login successful\n');
    } catch (error) {
        console.log(`❌ Login failed: ${error.message}`);
        return;
    }
    
    const headers = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
    };
    
    // Test Analytics Dashboard
    console.log('2. Testing Analytics Dashboard...');
    try {
        const response = await axios.get(`${BASE_URL}/analytics/dashboard?period=7d`, {
            headers,
            validateStatus: () => true
        });
        
        console.log(`   Status: ${response.status}`);
        if (response.status === 200) {
            console.log('   ✅ Analytics working');
            console.log(`   Total Views: ${response.data.data.overview.totalViews}`);
            console.log(`   Total Articles: ${response.data.data.content.totalArticles}`);
            console.log(`   Published: ${response.data.data.content.publishedArticles}`);
        } else {
            console.log(`   ❌ Failed: ${JSON.stringify(response.data).substring(0, 100)}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test Recycle Bin
    console.log('\n3. Testing Recycle Bin...');
    try {
        const response = await axios.get(`${BASE_URL}/admin/recycle-bin`, {
            headers,
            validateStatus: () => true
        });
        
        console.log(`   Status: ${response.status}`);
        if (response.status === 200) {
            console.log('   ✅ Recycle bin working');
            console.log(`   Items in recycle bin: ${response.data.data.items.length}`);
        } else {
            console.log(`   ❌ Failed: ${JSON.stringify(response.data).substring(0, 100)}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test Recycle Bin Stats
    console.log('\n4. Testing Recycle Bin Stats...');
    try {
        const response = await axios.get(`${BASE_URL}/admin/recycle-bin/stats`, {
            headers,
            validateStatus: () => true
        });
        
        console.log(`   Status: ${response.status}`);
        if (response.status === 200) {
            console.log('   ✅ Recycle bin stats working');
            console.log(`   Total items: ${response.data.data.total}`);
            console.log(`   Expiring soon: ${response.data.data.expiringSoon}`);
        } else {
            console.log(`   ❌ Failed`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test Category Articles Count
    console.log('\n5. Testing Category Articles Count...');
    try {
        // Get first category
        const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
        if (categoriesResponse.data.data.length > 0) {
            const categoryId = categoriesResponse.data.data[0].id;
            const categoryName = categoriesResponse.data.data[0].name;
            
            const response = await axios.get(`${BASE_URL}/categories/admin/${categoryId}/articles-count`, {
                headers,
                validateStatus: () => true
            });
            
            console.log(`   Status: ${response.status}`);
            if (response.status === 200) {
                console.log(`   ✅ Category articles count working`);
                console.log(`   Category: ${categoryName}`);
                console.log(`   Total articles: ${response.data.data.articleCounts.total}`);
                console.log(`   Published: ${response.data.data.articleCounts.published}`);
            } else {
                console.log(`   ❌ Failed`);
            }
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test Category Articles Admin View
    console.log('\n6. Testing Category Articles Admin View...');
    try {
        const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
        if (categoriesResponse.data.data.length > 0) {
            const categoryId = categoriesResponse.data.data[0].id;
            
            const response = await axios.get(`${BASE_URL}/categories/admin/${categoryId}/articles`, {
                headers,
                validateStatus: () => true
            });
            
            console.log(`   Status: ${response.status}`);
            if (response.status === 200) {
                console.log(`   ✅ Category articles admin view working`);
                console.log(`   Articles in category: ${response.data.data.articles.length}`);
            } else {
                console.log(`   ❌ Failed`);
            }
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test Concurrent Login
    console.log('\n7. Testing Concurrent Login Support...');
    try {
        const login1 = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        });
        
        const login2 = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        });
        
        const token1 = login1.data.data.token;
        const token2 = login2.data.data.token;
        
        // Test both tokens work
        const test1 = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token1}` },
            validateStatus: () => true
        });
        
        const test2 = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token2}` },
            validateStatus: () => true
        });
        
        if (test1.status === 200 && test2.status === 200) {
            console.log('   ✅ Concurrent login working');
            console.log('   Both sessions active simultaneously');
        } else {
            console.log('   ⚠️ One or both sessions failed');
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n✅ NEW FEATURES TEST COMPLETE');
}

testNewFeatures().catch(console.error);
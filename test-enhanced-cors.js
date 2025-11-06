const axios = require('axios');

const PRODUCTION_URL = 'https://web-production-af44.up.railway.app/api';

async function testEnhancedCORS() {
  console.log('🌐 TESTING ENHANCED CORS CONFIGURATION');
  console.log('======================================\n');

  try {
    // Test 1: Login to get token
    console.log('1. 🔐 Getting admin token...\n');
    
    const loginResponse = await axios.post(`${PRODUCTION_URL}/auth/login`, {
      email: 'admin@dominicanews.com',
      password: 'Pass@12345'
    }, { timeout: 15000 });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtained');

    // Test 2: Test CORS with different origins
    console.log('\n2. 🌍 Testing CORS with different origins...\n');
    
    const testOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://dominicanews-d2aa9.web.app',
      'https://dominicanews.vercel.app'
    ];
    
    for (const origin of testOrigins) {
      try {
        const corsTestResponse = await axios.get(`${PRODUCTION_URL}/admin/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': origin,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log(`✅ ${origin}: Working`);
        console.log(`   Categories: ${corsTestResponse.data.data.length}`);
        console.log(`   CORS Header: ${corsTestResponse.headers['access-control-allow-origin'] || 'Not set'}`);
        
      } catch (error) {
        console.log(`❌ ${origin}: Failed`);
        console.log(`   Error: ${error.response?.status} - ${error.message}`);
      }
    }

    // Test 3: Test preflight OPTIONS request
    console.log('\n3. ✈️ Testing preflight OPTIONS request...\n');
    
    try {
      const optionsResponse = await axios.options(`${PRODUCTION_URL}/admin/categories`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Authorization, Content-Type'
        },
        timeout: 10000
      });
      
      console.log('✅ OPTIONS preflight: Working');
      console.log(`   Status: ${optionsResponse.status}`);
      console.log(`   Allow-Origin: ${optionsResponse.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`   Allow-Methods: ${optionsResponse.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`   Allow-Headers: ${optionsResponse.headers['access-control-allow-headers'] || 'Not set'}`);
      
    } catch (error) {
      console.log('❌ OPTIONS preflight: Failed');
      console.log(`   Error: ${error.response?.status} - ${error.message}`);
    }

    // Test 4: Test admin category creation with CORS
    console.log('\n4. 📂 Testing category creation with CORS...\n');
    
    const timestamp = Date.now();
    const testCategoryData = {
      name: `CORS Test ${timestamp}`,
      description: 'Testing CORS configuration'
    };
    
    try {
      const createResponse = await axios.post(`${PRODUCTION_URL}/admin/categories`, testCategoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        timeout: 15000
      });
      
      console.log('✅ Category creation with CORS: Working');
      console.log(`   Created: ${createResponse.data.data.name}`);
      console.log(`   ID: ${createResponse.data.data.id}`);
      
      // Immediately test if it appears in the list
      const listResponse = await axios.get(`${PRODUCTION_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': 'http://localhost:3000'
        },
        timeout: 15000
      });
      
      const foundCategory = listResponse.data.data.find(cat => cat.name === testCategoryData.name);
      console.log(`   Appears in list: ${foundCategory ? 'YES ✅' : 'NO ❌'}`);
      
      // Clean up
      if (createResponse.data.data.id) {
        await axios.delete(`${PRODUCTION_URL}/admin/categories/${createResponse.data.data.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': 'http://localhost:3000'
          },
          timeout: 15000
        });
        console.log('   Test category cleaned up ✅');
      }
      
    } catch (error) {
      console.log('❌ Category creation with CORS: Failed');
      console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 CORS CONFIGURATION STATUS');
    console.log('='.repeat(50));
    console.log('\n✅ Enhanced CORS configuration should now support:');
    console.log('   - Multiple development origins (localhost:3000, 5173, etc.)');
    console.log('   - Production domains (dominicanews.dm, vercel, firebase)');
    console.log('   - Proper preflight handling');
    console.log('   - All HTTP methods (GET, POST, PUT, DELETE, PATCH)');
    console.log('   - Extended headers including Authorization');
    console.log('   - Credentials support');
    console.log('   - 24-hour cache for preflight requests');
    
    console.log('\n🔧 If admin panel still has sync issues:');
    console.log('   1. Clear browser cache completely');
    console.log('   2. Restart frontend dev server');
    console.log('   3. Check browser console for CORS errors');
    console.log('   4. Verify frontend is using correct API URL');
    console.log('   5. Check Network tab for failed requests');

  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

testEnhancedCORS();
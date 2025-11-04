const axios = require('axios');

const PRODUCTION_URL = 'https://web-production-af44.up.railway.app/api';

async function testBasicProduction() {
  console.log('🔍 Testing Basic Production Endpoints...\n');
  console.log(`🌐 Production URL: ${PRODUCTION_URL}\n`);

  try {
    // Test health
    console.log('1. Testing health...');
    const health = await axios.get(`${PRODUCTION_URL}/health`, { timeout: 15000 });
    console.log(`✅ Health: ${health.data.status}`);
    console.log(`   Environment: ${health.data.environment}`);

    // Test basic articles endpoint
    console.log('\n2. Testing basic articles endpoint...');
    const articles = await axios.get(`${PRODUCTION_URL}/articles`, { timeout: 15000 });
    console.log(`✅ Articles: ${articles.data.data.length} found`);

    // Test if /latest route exists
    console.log('\n3. Testing /latest route...');
    try {
      const latest = await axios.get(`${PRODUCTION_URL}/articles/latest`, { timeout: 15000 });
      console.log(`✅ Latest articles: ${latest.data.data.length} found`);
    } catch (error) {
      console.log(`❌ Latest route failed: ${error.response?.data?.message || error.message}`);
      console.log('   This means production doesn\'t have the latest code changes');
    }

    // Test categories
    console.log('\n4. Testing categories...');
    const categories = await axios.get(`${PRODUCTION_URL}/categories`, { timeout: 15000 });
    console.log(`✅ Categories: ${categories.data.data.length} found`);

    // Test admin endpoints
    console.log('\n5. Testing admin endpoints...');
    const adminCategories = await axios.get(`${PRODUCTION_URL}/admin/categories`, { timeout: 15000 });
    console.log(`✅ Admin categories: ${adminCategories.data.data.length} found`);

    // Test admin login
    console.log('\n6. Testing admin login...');
    const login = await axios.post(`${PRODUCTION_URL}/auth/login`, {
      email: 'admin@dominicanews.com',
      password: 'Pass@12345'
    }, { timeout: 15000 });
    console.log(`✅ Admin login: ${login.data.success ? 'Working' : 'Failed'}`);

    console.log('\n📊 Production Status Summary:');
    console.log(`   🌐 API URL: ${PRODUCTION_URL}`);
    console.log(`   📝 Articles: ${articles.data.data.length} available`);
    console.log(`   📂 Categories: ${categories.data.data.length} available`);
    console.log(`   🔐 Admin auth: ${login.data.success ? 'Working' : 'Failed'}`);

    console.log('\n🔧 Next Steps:');
    if (articles.data.data.length === 0) {
      console.log('   ⚠️ No articles found - may need to seed production database');
    }
    console.log('   1. Deploy latest code changes to Railway');
    console.log('   2. Wait for deployment to complete');
    console.log('   3. Test again with updated endpoints');

  } catch (error) {
    console.error('❌ Production test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🚨 Cannot connect to production server');
    } else if (error.response?.status === 500) {
      console.error('\n🚨 Server error - check Railway logs');
    }
  }
}

testBasicProduction();
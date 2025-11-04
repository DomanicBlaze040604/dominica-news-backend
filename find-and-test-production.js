const axios = require('axios');

// 🔧 COMMON RAILWAY URL PATTERNS - UPDATE WITH YOUR ACTUAL URL
const POSSIBLE_URLS = [
  'https://web-production-af44.up.railway.app',
  'https://dominica-news-backend-production.up.railway.app',
  'https://dominica-news-production.up.railway.app',
  // Add your actual Railway URL here when you get it
];

async function findAndTestProduction() {
  console.log('🔍 Finding and Testing Production URL...\n');

  for (const baseUrl of POSSIBLE_URLS) {
    const apiUrl = `${baseUrl}/api`;
    console.log(`🧪 Testing: ${apiUrl}`);

    try {
      // Test health endpoint with timeout
      const health = await axios.get(`${apiUrl}/health`, { 
        timeout: 10000,
        headers: { 'User-Agent': 'Dominica-News-Test' }
      });
      
      if (health.data.status === 'ok') {
        console.log(`✅ FOUND WORKING PRODUCTION API: ${apiUrl}\n`);
        
        // Run full test suite on working URL
        await runFullProductionTest(apiUrl);
        return;
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Connection refused');
      } else if (error.code === 'ENOTFOUND') {
        console.log('   ❌ URL not found');
      } else if (error.response?.status) {
        console.log(`   ❌ HTTP ${error.response.status}: ${error.response.statusText}`);
      } else {
        console.log(`   ❌ ${error.message}`);
      }
    }
  }

  console.log('\n🚨 NO WORKING PRODUCTION URL FOUND');
  console.log('\n📋 Next Steps:');
  console.log('1. Get your actual Railway URL from Railway dashboard');
  console.log('2. Update POSSIBLE_URLS array in this script');
  console.log('3. Or update test-production-api.js with correct URL');
  console.log('4. Run the test again');
}

async function runFullProductionTest(apiUrl) {
  console.log('🎯 Running Full Production Test...\n');

  try {
    // Test articles
    console.log('1. Testing articles...');
    const articles = await axios.get(`${apiUrl}/articles/latest?limit=6`, { timeout: 15000 });
    console.log(`✅ Articles: ${articles.data.data.length} found`);

    // Test categories
    console.log('\n2. Testing categories...');
    const categories = await axios.get(`${apiUrl}/categories`, { timeout: 15000 });
    console.log(`✅ Categories: ${categories.data.data.length} found`);

    // Test admin endpoints
    console.log('\n3. Testing admin endpoints...');
    const adminArticles = await axios.get(`${apiUrl}/admin/articles`, { timeout: 15000 });
    const adminCategories = await axios.get(`${apiUrl}/admin/categories`, { timeout: 15000 });
    console.log(`✅ Admin articles: ${adminArticles.data.data.length} found`);
    console.log(`✅ Admin categories: ${adminCategories.data.data.length} found`);

    // Test admin login
    console.log('\n4. Testing admin authentication...');
    const login = await axios.post(`${apiUrl}/auth/login`, {
      email: 'admin@dominicanews.com',
      password: 'Pass@12345'
    }, { timeout: 15000 });
    console.log(`✅ Admin login: ${login.data.success ? 'Working' : 'Failed'}`);

    // Test settings
    console.log('\n5. Testing settings...');
    const settings = await axios.get(`${apiUrl}/settings`, { timeout: 15000 });
    const socialMedia = await axios.get(`${apiUrl}/settings/social-media`, { timeout: 15000 });
    console.log(`✅ Settings: ${settings.data.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Social media: ${socialMedia.data.success ? 'Working' : 'Failed'}`);

    console.log('\n🎉 PRODUCTION API IS FULLY WORKING!');
    console.log(`\n🔗 Your Production API: ${apiUrl}`);
    console.log('\n📋 Frontend Integration:');
    console.log(`   Update your frontend .env file:`);
    console.log(`   VITE_API_BASE_URL=${apiUrl}`);
    console.log('\n✅ Ready for frontend integration!');

  } catch (error) {
    console.error('\n❌ Production test failed:', error.response?.data?.message || error.message);
  }
}

findAndTestProduction();
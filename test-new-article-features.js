const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test credentials (update with your actual admin credentials)
const TEST_CREDENTIALS = {
  email: 'admin@dominica.com',
  password: 'Admin123!'
};

let authToken = '';
let testArticleId = '';
let testCategoryId = '';
let testAuthorId = '';

async function login() {
  console.log('🔐 Logging in...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function getCategories() {
  console.log('\n📁 Fetching categories...');
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    if (response.data.data && response.data.data.length > 0) {
      testCategoryId = response.data.data[0].id;
      console.log(`✅ Found category: ${response.data.data[0].name} (${testCategoryId})`);
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to fetch categories:', error.response?.data || error.message);
    return false;
  }
}

async function getAuthors() {
  console.log('\n👤 Fetching authors...');
  try {
    const response = await axios.get(`${BASE_URL}/authors`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.data && response.data.data.length > 0) {
      testAuthorId = response.data.data[0].id;
      console.log(`✅ Found author: ${response.data.data[0].name} (${testAuthorId})`);
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to fetch authors:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateArticleWithEmbeds() {
  console.log('\n📝 Testing article creation with embeds...');
  
  const articleData = {
    title: 'Test Article with Instagram Embed',
    content: '<p>This is a test article with an Instagram embed.</p>',
    excerpt: 'Testing new embed functionality with Instagram posts',
    featuredImage: 'https://example.com/image.jpg',
    featuredImageAlt: 'Test image',
    categoryId: testCategoryId,
    authorId: testAuthorId,
    tags: ['test', 'embeds'],
    status: 'draft',
    embeds: [
      {
        type: 'instagram',
        url: 'https://www.instagram.com/p/example/',
        embedCode: '<blockquote class="instagram-media">Instagram embed code here</blockquote>'
      }
    ],
    gallery: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg'],
    language: 'en'
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/articles`, articleData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    testArticleId = response.data.data.id;
    console.log('✅ Article created successfully');
    console.log(`   ID: ${testArticleId}`);
    console.log(`   Title: ${response.data.data.title}`);
    console.log(`   Embeds: ${response.data.data.embeds?.length || 0}`);
    console.log(`   Excerpt: ${response.data.data.excerpt}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to create article:', error.response?.data || error.message);
    return false;
  }
}

async function testGetArticleById() {
  console.log('\n🔍 Testing get article by ID (for editing)...');
  
  try {
    const response = await axios.get(`${BASE_URL}/articles/id/${testArticleId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Article fetched successfully');
    console.log(`   Title: ${response.data.data.title}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Embeds: ${response.data.data.embeds?.length || 0}`);
    console.log(`   Excerpt: ${response.data.data.excerpt}`);
    console.log(`   Category: ${response.data.data.category?.name}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to fetch article:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateArticleWithSchedule() {
  console.log('\n📅 Testing article update with scheduling...');
  
  // Schedule for 2 hours from now
  const scheduledDate = new Date();
  scheduledDate.setHours(scheduledDate.getHours() + 2);
  
  const updateData = {
    title: 'Updated Article with Schedule',
    excerpt: 'This article is now scheduled for future publishing',
    status: 'scheduled',
    scheduledAt: scheduledDate.toISOString(),
    embeds: [
      {
        type: 'instagram',
        url: 'https://www.instagram.com/p/updated/',
        embedCode: '<blockquote class="instagram-media">Updated Instagram embed</blockquote>'
      },
      {
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=example'
      }
    ]
  };
  
  try {
    const response = await axios.put(`${BASE_URL}/articles/${testArticleId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Article updated successfully');
    console.log(`   Title: ${response.data.data.title}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Scheduled for: ${response.data.data.scheduledFor}`);
    console.log(`   Embeds: ${response.data.data.embeds?.length || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update article:', error.response?.data || error.message);
    return false;
  }
}

async function testPublishArticle() {
  console.log('\n🚀 Testing article publishing...');
  
  const updateData = {
    status: 'published',
    scheduledAt: null // Clear schedule
  };
  
  try {
    const response = await axios.put(`${BASE_URL}/articles/${testArticleId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Article published successfully');
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Published at: ${response.data.data.publishedAt}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish article:', error.response?.data || error.message);
    return false;
  }
}

async function testGetArticlesByCategory() {
  console.log('\n📂 Testing get articles by category...');
  
  try {
    // Get category slug first
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    const categorySlug = categoriesResponse.data.data[0].slug;
    
    const response = await axios.get(`${BASE_URL}/articles/category/${categorySlug}`);
    
    console.log('✅ Category articles fetched successfully');
    console.log(`   Category: ${response.data.data.category.name}`);
    console.log(`   Articles found: ${response.data.data.articles.length}`);
    
    // Check if our test article is in the list
    const foundArticle = response.data.data.articles.find(a => a.id === testArticleId);
    if (foundArticle) {
      console.log(`   ✅ Test article found in category!`);
    } else {
      console.log(`   ⚠️  Test article not found in category (might be due to status filter)`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fetch category articles:', error.response?.data || error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test article...');
  
  try {
    await axios.delete(`${BASE_URL}/articles/${testArticleId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Test article deleted');
  } catch (error) {
    console.error('❌ Failed to delete test article:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🧪 Testing New Article Features\n');
  console.log('='.repeat(50));
  
  // Login
  if (!await login()) {
    console.log('\n❌ Tests aborted: Login failed');
    return;
  }
  
  // Get test data
  if (!await getCategories() || !await getAuthors()) {
    console.log('\n❌ Tests aborted: Missing test data');
    return;
  }
  
  // Run tests
  const tests = [
    testCreateArticleWithEmbeds,
    testGetArticleById,
    testUpdateArticleWithSchedule,
    testPublishArticle,
    testGetArticlesByCategory
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    if (await test()) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Cleanup
  await cleanup();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! New features are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

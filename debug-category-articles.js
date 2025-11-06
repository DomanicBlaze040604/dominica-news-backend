const axios = require('axios');

async function debugCategoryArticles() {
    const BASE_URL = 'https://web-production-af44.up.railway.app/api';
    
    console.log('🔍 DEBUGGING CATEGORY ARTICLES ENDPOINT\n');
    
    // First, get all categories
    console.log('1. Getting all categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    const categories = categoriesResponse.data.data;
    console.log(`Found ${categories.length} categories`);
    
    // Test each category
    for (const category of categories.slice(0, 3)) { // Test first 3
        console.log(`\n2. Testing category: ${category.name} (slug: ${category.slug})`);
        
        // Test the direct article controller route
        console.log('   Testing via /articles/category/:slug');
        try {
            const response1 = await axios.get(`${BASE_URL}/articles/category/${category.slug}`, {
                validateStatus: () => true
            });
            console.log(`   Status: ${response1.status}`);
            if (response1.status === 200) {
                console.log(`   ✅ Articles found: ${response1.data.data.articles?.length || 0}`);
            } else {
                console.log(`   ❌ Error: ${JSON.stringify(response1.data)}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test the category route
        console.log('   Testing via /categories/:slug/articles');
        try {
            const response2 = await axios.get(`${BASE_URL}/categories/${category.slug}/articles`, {
                validateStatus: () => true
            });
            console.log(`   Status: ${response2.status}`);
            if (response2.status === 200) {
                console.log(`   ✅ Articles found: ${response2.data.data.articles?.length || 0}`);
            } else {
                console.log(`   ❌ Error: ${JSON.stringify(response2.data)}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    // Test with query parameters
    console.log(`\n3. Testing with query parameters...`);
    const testCategory = categories[0];
    try {
        const response = await axios.get(`${BASE_URL}/categories/${testCategory.slug}/articles?limit=5&status=published`, {
            validateStatus: () => true
        });
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

debugCategoryArticles().catch(console.error);
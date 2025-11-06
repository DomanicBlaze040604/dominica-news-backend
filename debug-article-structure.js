const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function debugArticleStructure() {
    console.log('🔍 DEBUGGING ARTICLE STRUCTURE\n');
    
    // Login first
    console.log('1. Logging in...');
    let adminToken;
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        });
        
        adminToken = loginResponse.data.data.token;
        console.log('✅ Login successful');
    } catch (error) {
        console.log(`❌ Login error: ${error.message}`);
        return;
    }
    
    // Get articles and show full structure
    console.log('\n2. Fetching articles with full structure...');
    try {
        const response = await axios.get(`${BASE_URL}/admin/articles`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (response.data.success) {
            const articles = response.data.data;
            console.log(`Found ${articles.length} articles\n`);
            
            // Show structure of first few articles
            articles.slice(0, 3).forEach((article, index) => {
                console.log(`Article ${index + 1} structure:`);
                console.log(`Title: "${article.title}"`);
                console.log(`ID: ${article._id || article.id}`);
                console.log(`Slug: ${article.slug}`);
                console.log(`Status: ${article.status}`);
                console.log(`Keys: ${Object.keys(article).join(', ')}`);
                console.log('---');
            });
            
            // Find test articles with correct ID field
            const testArticles = articles.filter(article => 
                article.title.includes('Test Article') || 
                article.title.includes('1762248888581') ||
                article.title.includes('Correct ID Test Article')
            );
            
            console.log(`\nTest articles found:`);
            testArticles.forEach(article => {
                console.log(`- Title: "${article.title}"`);
                console.log(`  ID: ${article._id || article.id}`);
                console.log(`  All keys: ${Object.keys(article).join(', ')}`);
                console.log('');
            });
            
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

debugArticleStructure().catch(console.error);
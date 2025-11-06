const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function deleteTestArticles() {
    console.log('🗑️ DELETING TEST ARTICLES (FIXED VERSION)\n');
    
    // Login first
    console.log('1. Logging in as admin...');
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
    
    // Get articles
    console.log('\n2. Fetching articles...');
    try {
        const response = await axios.get(`${BASE_URL}/admin/articles`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (response.data.success) {
            const articles = response.data.data;
            console.log(`Found ${articles.length} total articles`);
            
            // Find test articles using correct ID field
            const testArticles = articles.filter(article => 
                article.title.includes('Test Article') || 
                article.title.includes('1762248888581') ||
                article.title.includes('Correct ID Test Article')
            );
            
            console.log(`\nTest articles to delete:`);
            testArticles.forEach(article => {
                console.log(`- "${article.title}" (ID: ${article.id})`);
            });
            
            if (testArticles.length === 0) {
                console.log('✅ No test articles found');
                return;
            }
            
            // Delete each test article
            console.log('\n3. Deleting test articles...');
            let deletedCount = 0;
            
            for (const article of testArticles) {
                try {
                    console.log(`Deleting: "${article.title}"...`);
                    
                    const deleteResponse = await axios.delete(`${BASE_URL}/admin/articles/${article.id}`, {
                        headers: {
                            'Authorization': `Bearer ${adminToken}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    });
                    
                    if (deleteResponse.status === 200 && deleteResponse.data.success) {
                        console.log(`✅ Successfully deleted: "${article.title}"`);
                        deletedCount++;
                    } else {
                        console.log(`❌ Failed to delete: "${article.title}"`);
                        console.log(`   Response: ${JSON.stringify(deleteResponse.data)}`);
                    }
                    
                    // Small delay between deletions
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (error) {
                    console.log(`❌ Error deleting "${article.title}": ${error.message}`);
                    if (error.response) {
                        console.log(`   Status: ${error.response.status}`);
                        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
                    }
                }
            }
            
            console.log(`\n📊 DELETION SUMMARY:`);
            console.log(`Articles to delete: ${testArticles.length}`);
            console.log(`Successfully deleted: ${deletedCount}`);
            console.log(`Failed: ${testArticles.length - deletedCount}`);
            
            // Verify deletion
            console.log('\n4. Verifying deletion...');
            const verifyResponse = await axios.get(`${BASE_URL}/admin/articles`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            
            if (verifyResponse.data.success) {
                const remainingArticles = verifyResponse.data.data;
                const remainingTestArticles = remainingArticles.filter(article => 
                    article.title.includes('Test Article') || 
                    article.title.includes('1762248888581') ||
                    article.title.includes('Correct ID Test Article')
                );
                
                console.log(`\n✅ FINAL RESULTS:`);
                console.log(`Total articles remaining: ${remainingArticles.length}`);
                console.log(`Test articles remaining: ${remainingTestArticles.length}`);
                
                if (remainingTestArticles.length === 0) {
                    console.log('🎉 All test articles successfully removed!');
                } else {
                    console.log('⚠️ Some test articles still exist:');
                    remainingTestArticles.forEach(article => {
                        console.log(`- "${article.title}" (ID: ${article.id})`);
                    });
                }
                
                console.log('\n📝 Remaining articles:');
                remainingArticles.forEach(article => {
                    console.log(`- "${article.title}" (${article.status})`);
                });
            }
            
        } else {
            console.log('❌ Failed to fetch articles');
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

deleteTestArticles().catch(console.error);
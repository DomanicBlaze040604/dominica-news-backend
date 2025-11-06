const axios = require('axios');

const BASE_URL = 'https://web-production-af44.up.railway.app/api';

async function removeTestArticles() {
    console.log('🗑️ REMOVING TEST ARTICLES\n');
    
    // First, login to get admin token
    console.log('1. Logging in as admin...');
    let adminToken;
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dominicanews.com',
            password: 'Pass@12345'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });
        
        if (loginResponse.data.success) {
            adminToken = loginResponse.data.data.token;
            console.log('✅ Login successful');
        } else {
            console.log('❌ Login failed');
            return;
        }
    } catch (error) {
        console.log(`❌ Login error: ${error.message}`);
        return;
    }
    
    // Get all articles to find the test ones
    console.log('\n2. Fetching all articles...');
    try {
        const articlesResponse = await axios.get(`${BASE_URL}/admin/articles`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        
        if (articlesResponse.data.success) {
            const articles = articlesResponse.data.data;
            console.log(`Found ${articles.length} total articles`);
            
            // Find test articles
            const testArticles = articles.filter(article => 
                article.title.includes('Test Article') || 
                article.title.includes('1762248888581') ||
                article.title.includes('Correct ID Test Article')
            );
            
            console.log(`\nFound ${testArticles.length} test articles to remove:`);
            testArticles.forEach(article => {
                console.log(`- "${article.title}" (ID: ${article._id})`);
            });
            
            // Delete each test article
            if (testArticles.length > 0) {
                console.log('\n3. Deleting test articles...');
                
                for (const article of testArticles) {
                    try {
                        const deleteResponse = await axios.delete(`${BASE_URL}/admin/articles/${article._id}`, {
                            headers: {
                                'Authorization': `Bearer ${adminToken}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        });
                        
                        if (deleteResponse.data.success) {
                            console.log(`✅ Deleted: "${article.title}"`);
                        } else {
                            console.log(`❌ Failed to delete: "${article.title}" - ${deleteResponse.data.message}`);
                        }
                    } catch (error) {
                        console.log(`❌ Error deleting "${article.title}": ${error.message}`);
                    }
                }
                
                console.log('\n4. Verification - Checking remaining articles...');
                
                // Verify deletion
                const verifyResponse = await axios.get(`${BASE_URL}/admin/articles`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                });
                
                if (verifyResponse.data.success) {
                    const remainingArticles = verifyResponse.data.data;
                    const remainingTestArticles = remainingArticles.filter(article => 
                        article.title.includes('Test Article') || 
                        article.title.includes('1762248888581') ||
                        article.title.includes('Correct ID Test Article')
                    );
                    
                    console.log(`\n📊 RESULTS:`);
                    console.log(`Total articles now: ${remainingArticles.length}`);
                    console.log(`Remaining test articles: ${remainingTestArticles.length}`);
                    
                    if (remainingTestArticles.length === 0) {
                        console.log('✅ All test articles successfully removed!');
                    } else {
                        console.log('⚠️ Some test articles still remain:');
                        remainingTestArticles.forEach(article => {
                            console.log(`- "${article.title}" (ID: ${article._id})`);
                        });
                    }
                    
                    console.log('\n📝 Current articles:');
                    remainingArticles.forEach(article => {
                        console.log(`- "${article.title}" (${article.status})`);
                    });
                }
                
            } else {
                console.log('✅ No test articles found to remove');
            }
            
        } else {
            console.log('❌ Failed to fetch articles');
        }
        
    } catch (error) {
        console.log(`❌ Error fetching articles: ${error.message}`);
    }
}

removeTestArticles().catch(console.error);
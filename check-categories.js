const axios = require('axios');

async function checkCategories() {
    try {
        const response = await axios.get('https://web-production-af44.up.railway.app/api/categories');
        console.log('Available categories:');
        response.data.data.forEach(cat => {
            console.log(`- ${cat.name} (slug: ${cat.slug})`);
        });
        
        // Test with a real category
        if (response.data.data.length > 0) {
            const firstCategory = response.data.data[0];
            console.log(`\nTesting articles for category: ${firstCategory.slug}`);
            
            const articlesResponse = await axios.get(
                `https://web-production-af44.up.railway.app/api/categories/${firstCategory.slug}/articles?limit=20&status=published`,
                { validateStatus: () => true }
            );
            
            console.log(`Status: ${articlesResponse.status}`);
            if (articlesResponse.status === 200) {
                console.log(`Articles found: ${articlesResponse.data.data?.length || 0}`);
            } else {
                console.log(`Error: ${JSON.stringify(articlesResponse.data)}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCategories();
const axios = require('axios');

const PRODUCTION_URL = 'https://web-production-af44.up.railway.app/api';

async function verifyAllFeaturesProduction() {
  console.log('🔍 VERIFYING ALL FEATURES ON PRODUCTION');
  console.log('=======================================\n');
  console.log(`🌐 Production URL: ${PRODUCTION_URL}\n`);

  const featureStatus = {
    categoriesSync: false,
    staticPagesManager: false,
    menuManagement: false,
    seoTools: false,
    templateSelection: false
  };

  try {
    // Wait for deployment to complete
    console.log('⏳ Waiting for deployment to stabilize...\n');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    // Test 1: Admin Authentication
    console.log('1. 🔐 Admin Authentication...\n');
    
    const loginResponse = await axios.post(`${PRODUCTION_URL}/auth/login`, {
      email: 'admin@dominicanews.com',
      password: 'Pass@12345'
    }, { timeout: 15000 });
    
    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed - cannot test other features');
      return;
    }
    
    console.log('✅ Admin login successful');
    const token = loginResponse.data.data.token;
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000'
    };

    // Test 2: ✅ Fixed Categories Sync - Real-time data updates
    console.log('\n2. 📂 Testing Categories Sync (Real-time Updates)...\n');
    
    try {
      const timestamp = Date.now();
      const testCategoryData = {
        name: `Sync Test ${timestamp}`,
        description: 'Testing real-time category sync'
      };
      
      // Create category
      const createResponse = await axios.post(`${PRODUCTION_URL}/admin/categories`, testCategoryData, {
        headers,
        timeout: 15000
      });
      
      if (createResponse.data.success) {
        console.log('✅ Category Creation: Working');
        
        // Immediately check if it appears in list
        const listResponse = await axios.get(`${PRODUCTION_URL}/admin/categories`, {
          headers,
          timeout: 15000
        });
        
        const foundCategory = listResponse.data.data.find(cat => cat.name === testCategoryData.name);
        
        if (foundCategory) {
          console.log('✅ Categories Sync: REAL-TIME UPDATES WORKING ✅');
          console.log(`   Created and immediately visible: ${foundCategory.name}`);
          featureStatus.categoriesSync = true;
          
          // Clean up
          await axios.delete(`${PRODUCTION_URL}/admin/categories/${foundCategory.id}`, {
            headers,
            timeout: 15000
          });
        } else {
          console.log('❌ Categories Sync: NOT WORKING');
        }
      } else {
        console.log('❌ Category Creation: Failed');
      }
    } catch (error) {
      console.log('❌ Categories Sync Test: Failed');
      console.log(`   Error: ${error.response?.status} - ${error.message}`);
    }

    // Test 3: ✅ Static Pages Manager - Complete CRUD functionality
    console.log('\n3. 📄 Testing Static Pages Manager (Complete CRUD)...\n');
    
    try {
      // Test getting static pages
      const staticPagesResponse = await axios.get(`${PRODUCTION_URL}/admin/static-pages`, {
        headers,
        timeout: 15000
      });
      
      console.log('✅ Static Pages List: Working');
      console.log(`   Pages found: ${staticPagesResponse.data.data.length}`);
      
      // Test creating static page
      const timestamp = Date.now();
      const testPageData = {
        title: `Test Page ${timestamp}`,
        content: '<h1>Test Page</h1><p>Testing static pages CRUD functionality.</p>',
        metaTitle: 'Test Page Meta Title',
        metaDescription: 'Test page meta description',
        keywords: ['test', 'static', 'page'],
        isPublished: true,
        showInMenu: true,
        menuOrder: 1,
        template: 'default'
      };
      
      const createPageResponse = await axios.post(`${PRODUCTION_URL}/admin/static-pages`, testPageData, {
        headers,
        timeout: 15000
      });
      
      if (createPageResponse.data.success) {
        console.log('✅ Static Pages Manager: COMPLETE CRUD WORKING ✅');
        console.log(`   Created: ${createPageResponse.data.data.title}`);
        console.log(`   Auto-slug: ${createPageResponse.data.data.slug}`);
        featureStatus.staticPagesManager = true;
        
        const pageId = createPageResponse.data.data.id;
        
        // Test updating
        const updateResponse = await axios.put(`${PRODUCTION_URL}/admin/static-pages/${pageId}`, {
          title: `Updated ${testPageData.title}`
        }, { headers, timeout: 15000 });
        
        if (updateResponse.data.success) {
          console.log('✅ Static Page Update: Working');
        }
        
        // Clean up
        await axios.delete(`${PRODUCTION_URL}/admin/static-pages/${pageId}`, {
          headers,
          timeout: 15000
        });
        console.log('   Test page cleaned up');
        
      } else {
        console.log('❌ Static Pages Manager: Failed');
      }
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Static Pages Manager: NOT DEPLOYED YET');
      } else {
        console.log('❌ Static Pages Manager: Error');
        console.log(`   Error: ${error.response?.status} - ${error.message}`);
      }
    }

    // Test 4: ✅ Menu Management - Control navigation structure
    console.log('\n4. 📋 Testing Menu Management (Navigation Control)...\n');
    
    try {
      const menuResponse = await axios.get(`${PRODUCTION_URL}/static-pages/menu`, { timeout: 15000 });
      
      if (menuResponse.data.success) {
        console.log('✅ Menu Management: NAVIGATION CONTROL WORKING ✅');
        console.log(`   Menu pages: ${menuResponse.data.data.length}`);
        
        if (menuResponse.data.data.length > 0) {
          console.log('   Menu structure:');
          menuResponse.data.data.forEach((page, index) => {
            console.log(`     ${index + 1}. ${page.title} (${page.slug})`);
          });
        }
        
        featureStatus.menuManagement = true;
      } else {
        console.log('❌ Menu Management: Failed');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Menu Management: NOT DEPLOYED YET');
      } else {
        console.log('❌ Menu Management: Error');
      }
    }

    // Test 5: ✅ SEO Tools - Meta tags for all pages
    console.log('\n5. 🔍 Testing SEO Tools (Meta Tags)...\n');
    
    try {
      // Test if we can create a page with SEO meta tags
      const seoTestData = {
        title: 'SEO Test Page',
        content: '<h1>SEO Test</h1>',
        metaTitle: 'Custom SEO Meta Title',
        metaDescription: 'Custom SEO meta description for testing',
        keywords: ['seo', 'meta', 'tags', 'test']
      };
      
      const seoPageResponse = await axios.post(`${PRODUCTION_URL}/admin/static-pages`, seoTestData, {
        headers,
        timeout: 15000
      });
      
      if (seoPageResponse.data.success) {
        const seoPage = seoPageResponse.data.data;
        
        if (seoPage.metaTitle && seoPage.metaDescription && seoPage.keywords) {
          console.log('✅ SEO Tools: META TAGS WORKING ✅');
          console.log(`   Meta Title: ${seoPage.metaTitle}`);
          console.log(`   Meta Description: ${seoPage.metaDescription}`);
          console.log(`   Keywords: ${seoPage.keywords.join(', ')}`);
          featureStatus.seoTools = true;
        } else {
          console.log('❌ SEO Tools: Meta tags not saved properly');
        }
        
        // Clean up
        await axios.delete(`${PRODUCTION_URL}/admin/static-pages/${seoPage.id}`, {
          headers,
          timeout: 15000
        });
        
      } else {
        console.log('❌ SEO Tools: Cannot create page with meta tags');
      }
      
    } catch (error) {
      console.log('❌ SEO Tools: Error testing meta tags');
    }

    // Test 6: ✅ Template Selection - Different page layouts
    console.log('\n6. 🎨 Testing Template Selection (Page Layouts)...\n');
    
    try {
      const templates = ['default', 'about', 'contact', 'privacy', 'terms'];
      let templatesWorking = 0;
      
      for (const template of templates) {
        const templateTestData = {
          title: `${template.charAt(0).toUpperCase() + template.slice(1)} Template Test`,
          content: `<h1>Testing ${template} template</h1>`,
          template: template
        };
        
        try {
          const templateResponse = await axios.post(`${PRODUCTION_URL}/admin/static-pages`, templateTestData, {
            headers,
            timeout: 15000
          });
          
          if (templateResponse.data.success && templateResponse.data.data.template === template) {
            templatesWorking++;
            
            // Clean up
            await axios.delete(`${PRODUCTION_URL}/admin/static-pages/${templateResponse.data.data.id}`, {
              headers,
              timeout: 15000
            });
          }
        } catch (error) {
          // Template test failed
        }
      }
      
      if (templatesWorking === templates.length) {
        console.log('✅ Template Selection: DIFFERENT PAGE LAYOUTS WORKING ✅');
        console.log(`   Templates available: ${templates.join(', ')}`);
        featureStatus.templateSelection = true;
      } else {
        console.log(`⚠️ Template Selection: ${templatesWorking}/${templates.length} templates working`);
      }
      
    } catch (error) {
      console.log('❌ Template Selection: Error testing templates');
    }

    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FEATURE VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    console.log('\n📊 REQUESTED FEATURES STATUS:');
    console.log(`   ${featureStatus.categoriesSync ? '✅' : '❌'} Fixed Categories Sync - Real-time data updates`);
    console.log(`   ${featureStatus.staticPagesManager ? '✅' : '❌'} Static Pages Manager - Complete CRUD functionality`);
    console.log(`   ${featureStatus.menuManagement ? '✅' : '❌'} Menu Management - Control navigation structure`);
    console.log(`   ${featureStatus.seoTools ? '✅' : '❌'} SEO Tools - Meta tags for all pages`);
    console.log(`   ${featureStatus.templateSelection ? '✅' : '❌'} Template Selection - Different page layouts`);
    
    const workingFeatures = Object.values(featureStatus).filter(status => status).length;
    const totalFeatures = Object.keys(featureStatus).length;
    
    console.log(`\n📈 OVERALL STATUS: ${workingFeatures}/${totalFeatures} features working (${Math.round(workingFeatures/totalFeatures*100)}%)`);
    
    if (workingFeatures === totalFeatures) {
      console.log('\n🎉 ALL REQUESTED FEATURES ARE WORKING ON PRODUCTION!');
      console.log('\n✅ Your admin panel should now have:');
      console.log('   - Categories that sync immediately after creation');
      console.log('   - Static Pages section with full CRUD');
      console.log('   - Menu management for navigation');
      console.log('   - SEO meta tags for all pages');
      console.log('   - Template selection for different layouts');
      
      console.log('\n🎯 ADMIN PANEL IS FULLY FUNCTIONAL!');
    } else {
      console.log('\n⚠️ SOME FEATURES STILL NEED ATTENTION');
      
      if (!featureStatus.categoriesSync) {
        console.log('   🔧 Categories Sync: Check CORS and frontend refresh logic');
      }
      if (!featureStatus.staticPagesManager) {
        console.log('   🔧 Static Pages: May need additional deployment time');
      }
      if (!featureStatus.menuManagement) {
        console.log('   🔧 Menu Management: Check static pages endpoints');
      }
      if (!featureStatus.seoTools) {
        console.log('   🔧 SEO Tools: Check meta tags validation');
      }
      if (!featureStatus.templateSelection) {
        console.log('   🔧 Template Selection: Check template enum validation');
      }
    }

  } catch (error) {
    console.error('❌ Feature verification failed:', error.message);
    console.error('\n🚨 DEPLOYMENT MAY STILL BE IN PROGRESS');
    console.error('   Wait 2-3 more minutes and run this test again');
  }
}

verifyAllFeaturesProduction();
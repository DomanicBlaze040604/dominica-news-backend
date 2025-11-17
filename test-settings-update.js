const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dominica-news')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const Settings = mongoose.model('Settings');

async function testSettingsUpdate() {
  try {
    console.log('\n📝 Testing settings update...\n');
    
    // Get current settings
    let settings = await Settings.findOne();
    console.log('Current settings:', settings ? 'Found' : 'Not found');
    
    if (!settings) {
      console.log('Creating new settings document...');
      settings = new Settings({
        siteName: 'Dominica News',
        siteDescription: 'Your trusted source for news and information about Dominica'
      });
    }
    
    // Test data
    const testData = {
      homepageSectionOrder: ['live-news', 'breaking-news', 'latest', 'featured'],
      homepageCategories: ['cat1', 'cat2', 'cat3'],
      showLiveNewsOnHomepage: true,
      showBreakingNewsOnHomepage: true,
      showFeaturedNewsOnHomepage: false,
      showLatestNewsOnHomepage: true
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    // Update settings
    settings.homepageSectionOrder = testData.homepageSectionOrder;
    settings.homepageCategories = testData.homepageCategories;
    settings.showLiveNewsOnHomepage = testData.showLiveNewsOnHomepage;
    settings.showBreakingNewsOnHomepage = testData.showBreakingNewsOnHomepage;
    settings.showFeaturedNewsOnHomepage = testData.showFeaturedNewsOnHomepage;
    settings.showLatestNewsOnHomepage = testData.showLatestNewsOnHomepage;
    
    console.log('\nSaving settings...');
    await settings.save({ validateBeforeSave: false });
    console.log('✅ Settings saved successfully!');
    
    // Verify
    const updated = await Settings.findOne();
    console.log('\nVerified settings from DB:');
    console.log('  homepageSectionOrder:', updated.homepageSectionOrder);
    console.log('  homepageCategories:', updated.homepageCategories);
    console.log('  showLiveNewsOnHomepage:', updated.showLiveNewsOnHomepage);
    console.log('  showBreakingNewsOnHomepage:', updated.showBreakingNewsOnHomepage);
    console.log('  showFeaturedNewsOnHomepage:', updated.showFeaturedNewsOnHomepage);
    console.log('  showLatestNewsOnHomepage:', updated.showLatestNewsOnHomepage);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Wait for model to be registered
setTimeout(() => {
  testSettingsUpdate();
}, 1000);

// Quick script to test and fix settings in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const settingsSchema = new mongoose.Schema({
  siteName: String,
  siteDescription: String,
  homepageCategories: [String], // Changed to String array instead of ObjectId
  homepageSectionOrder: String,
}, { timestamps: true, strict: false });

const Settings = mongoose.model('Settings', settingsSchema);

async function testSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dominica-news');
    console.log('✅ Connected to MongoDB');

    // Get current settings
    let settings = await Settings.findOne();
    console.log('\n📋 Current settings:');
    console.log('homepageCategories:', settings?.homepageCategories);
    console.log('homepageSectionOrder:', settings?.homepageSectionOrder);

    // Update with test data
    const testCategories = ['cat1', 'cat2', 'cat3', 'cat4', 'cat5'];
    
    if (!settings) {
      settings = new Settings({
        siteName: 'Dominica News',
        siteDescription: 'Test',
        homepageCategories: testCategories,
        homepageSectionOrder: 'latest-first'
      });
    } else {
      settings.homepageCategories = testCategories;
      settings.homepageSectionOrder = 'latest-first';
    }

    await settings.save();
    console.log('\n✅ Settings updated with test data');

    // Verify
    const updated = await Settings.findOne();
    console.log('\n📋 Updated settings:');
    console.log('homepageCategories:', updated?.homepageCategories);
    console.log('homepageSectionOrder:', updated?.homepageSectionOrder);

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSettings();

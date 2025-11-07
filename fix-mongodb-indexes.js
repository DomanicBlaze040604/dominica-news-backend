/**
 * Fix MongoDB Duplicate Index Issues
 * Run this script to clean up duplicate indexes
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function fixIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\n📋 Found collections:', collections.map(c => c.name).join(', '));

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n🔍 Checking indexes for: ${collectionName}`);

      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`   Found ${indexes.length} indexes`);

        // Drop all indexes except _id
        for (const index of indexes) {
          if (index.name !== '_id_') {
            try {
              await db.collection(collectionName).dropIndex(index.name);
              console.log(`   ✅ Dropped index: ${index.name}`);
            } catch (error) {
              console.log(`   ⚠️  Could not drop ${index.name}: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n✅ Index cleanup complete!');
    console.log('🔄 Restart your backend server to recreate indexes properly.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

fixIndexes();

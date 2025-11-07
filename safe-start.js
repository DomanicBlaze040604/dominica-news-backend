/**
 * Safe Start Script
 * Handles MongoDB index issues gracefully before starting the server
 */

const { spawn } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function checkAndFixIndexes() {
  try {
    console.log('🔍 Checking MongoDB connection and indexes...');
    
    // Set mongoose options to suppress warnings
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📋 Found ${collections.length} collections`);
    
    // Check for duplicate indexes
    let hasDuplicates = false;
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      const indexNames = indexes.map(i => i.name);
      const uniqueNames = new Set(indexNames);
      
      if (indexNames.length !== uniqueNames.size) {
        hasDuplicates = true;
        console.log(`⚠️  Duplicate indexes found in ${collection.name}`);
      }
    }
    
    if (hasDuplicates) {
      console.log('🔧 Fixing duplicate indexes...');
      // Note: In production, you might want to be more careful about dropping indexes
      console.log('⚠️  Please run: node fix-mongodb-indexes.js');
    } else {
      console.log('✅ No duplicate indexes found');
    }
    
    await mongoose.disconnect();
    console.log('👍 MongoDB check complete\n');
    
  } catch (error) {
    console.error('❌ MongoDB check failed:', error.message);
    console.log('⚠️  Continuing anyway - server will attempt to start\n');
  }
}

// Run the check and then start the server
checkAndFixIndexes().then(() => {
  console.log('🚀 Starting server...\n');
  
  // Start the actual server
  const server = spawn('node', ['dist/server.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
}).catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});
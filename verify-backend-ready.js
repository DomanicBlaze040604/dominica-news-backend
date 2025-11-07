/**
 * Backend Verification Script
 * Tests that the backend is properly configured and ready for frontend integration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Backend Configuration...\n');

let allChecks = true;

// Check 1: server.ts exists and has proper content
console.log('✓ Checking server.ts...');
try {
  const serverContent = fs.readFileSync(path.join(__dirname, 'src', 'server.ts'), 'utf8');
  
  if (serverContent.includes('connectDB')) {
    console.log('  ✅ Database connection configured');
  } else {
    console.log('  ❌ Database connection missing');
    allChecks = false;
  }
  
  if (serverContent.includes('gracefulShutdown')) {
    console.log('  ✅ Graceful shutdown configured');
  } else {
    console.log('  ❌ Graceful shutdown missing');
    allChecks = false;
  }
  
  if (serverContent.includes('uncaughtException') && serverContent.includes('unhandledRejection')) {
    console.log('  ✅ Error handlers configured');
  } else {
    console.log('  ❌ Error handlers missing');
    allChecks = false;
  }
} catch (error) {
  console.log('  ❌ server.ts not found or unreadable');
  allChecks = false;
}

// Check 2: app.ts has proper rate limiting
console.log('\n✓ Checking app.ts...');
try {
  const appContent = fs.readFileSync(path.join(__dirname, 'src', 'app.ts'), 'utf8');
  
  if (appContent.includes('50000000')) {
    console.log('  ✅ Rate limit set to 50,000,000 requests/minute');
  } else if (appContent.includes('50000')) {
    console.log('  ⚠️  Rate limit is 50,000 (not 50,000,000)');
  } else {
    console.log('  ❌ Rate limit not configured');
    allChecks = false;
  }
  
  if (appContent.includes('cors(')) {
    console.log('  ✅ CORS configured');
  } else {
    console.log('  ❌ CORS not configured');
    allChecks = false;
  }
  
  if (appContent.includes('/api/admin')) {
    console.log('  ✅ Admin routes configured');
  } else {
    console.log('  ❌ Admin routes missing');
    allChecks = false;
  }
  
  if (appContent.includes('errorHandler')) {
    console.log('  ✅ Error handler middleware configured');
  } else {
    console.log('  ❌ Error handler missing');
    allChecks = false;
  }
} catch (error) {
  console.log('  ❌ app.ts not found or unreadable');
  allChecks = false;
}

// Check 3: Build directory exists
console.log('\n✓ Checking build...');
try {
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('  ✅ Build directory exists');
    
    if (fs.existsSync(path.join(__dirname, 'dist', 'server.js'))) {
      console.log('  ✅ server.js compiled');
    } else {
      console.log('  ⚠️  server.js not found in dist (run npm run build)');
    }
    
    if (fs.existsSync(path.join(__dirname, 'dist', 'app.js'))) {
      console.log('  ✅ app.js compiled');
    } else {
      console.log('  ⚠️  app.js not found in dist (run npm run build)');
    }
  } else {
    console.log('  ⚠️  Build directory not found (run npm run build)');
  }
} catch (error) {
  console.log('  ⚠️  Could not check build directory');
}

// Check 4: Environment variables
console.log('\n✓ Checking environment...');
try {
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    console.log('  ✅ .env file exists');
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    
    if (envContent.includes('MONGODB_URI')) {
      console.log('  ✅ MONGODB_URI configured');
    } else {
      console.log('  ❌ MONGODB_URI missing');
      allChecks = false;
    }
    
    if (envContent.includes('JWT_SECRET')) {
      console.log('  ✅ JWT_SECRET configured');
    } else {
      console.log('  ❌ JWT_SECRET missing');
      allChecks = false;
    }
    
    if (envContent.includes('PORT')) {
      console.log('  ✅ PORT configured');
    } else {
      console.log('  ⚠️  PORT not set (will default to 5000)');
    }
  } else {
    console.log('  ❌ .env file not found');
    allChecks = false;
  }
} catch (error) {
  console.log('  ❌ Could not read .env file');
  allChecks = false;
}

// Check 5: Key routes exist
console.log('\n✓ Checking routes...');
const requiredRoutes = [
  'auth.ts',
  'articles.ts',
  'categories.ts',
  'authors.ts',
  'settings.ts',
  'staticPages.ts',
  'breaking-news.ts',
  'admin.ts',
  'recycleBin.ts',
  'analytics.ts'
];

let routesOk = true;
requiredRoutes.forEach(route => {
  const routePath = path.join(__dirname, 'src', 'routes', route);
  if (fs.existsSync(routePath)) {
    console.log(`  ✅ ${route} exists`);
  } else {
    console.log(`  ❌ ${route} missing`);
    routesOk = false;
    allChecks = false;
  }
});

// Check 6: Frontend integration guide
console.log('\n✓ Checking documentation...');
if (fs.existsSync(path.join(__dirname, 'FRONTEND-INTEGRATION-GUIDE.md'))) {
  console.log('  ✅ Frontend integration guide created');
} else {
  console.log('  ⚠️  Frontend integration guide not found');
}

// Final summary
console.log('\n' + '='.repeat(60));
if (allChecks) {
  console.log('✅ ALL CHECKS PASSED - Backend is ready for frontend integration!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Start the backend: npm run dev');
  console.log('   2. Read FRONTEND-INTEGRATION-GUIDE.md');
  console.log('   3. Configure your frontend API client');
  console.log('   4. Test authentication flow');
  console.log('   5. Implement API calls in your frontend');
} else {
  console.log('⚠️  SOME CHECKS FAILED - Please review the issues above');
  console.log('\n🔧 Recommended Actions:');
  console.log('   1. Fix any missing configurations');
  console.log('   2. Run: npm run build');
  console.log('   3. Run this script again');
}
console.log('='.repeat(60) + '\n');

process.exit(allChecks ? 0 : 1);

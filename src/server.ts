import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

// Load environment variables
dotenv.config();

// -----------------------------------------------------------------------------
// 🔧 Configuration
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dominica-news';
const NODE_ENV = process.env.NODE_ENV || 'development';

// -----------------------------------------------------------------------------
// 🗄️ Database Connection with Enhanced Error Handling
// -----------------------------------------------------------------------------
const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   Database: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 50, // Increased for high rate limit
      minPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(MONGODB_URI, options);

    console.log('✅ MongoDB connected successfully');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Ready State: ${mongoose.connection.readyState}`);

    // Monitor connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    if (error instanceof Error) {
      console.error('   Error Name:', error.name);
      console.error('   Error Message:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('ECONNREFUSED')) {
        console.error('   💡 Tip: Make sure MongoDB is running');
      } else if (error.message.includes('authentication failed')) {
        console.error('   💡 Tip: Check your MongoDB credentials');
      } else if (error.message.includes('network')) {
        console.error('   💡 Tip: Check your network connection and firewall settings');
      }
    }

    // Exit process with failure
    process.exit(1);
  }
};

// -----------------------------------------------------------------------------
// 🚀 Server Startup with Enhanced Error Handling
// -----------------------------------------------------------------------------
const startServer = async (): Promise<void> => {
  try {
    // Connect to database first
    await connectDB();

    // Start the server
    const server = app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`   Dominica News API Server`);
      console.log('   ========================================');
      console.log(`   🌍 Environment: ${NODE_ENV}`);
      console.log(`   🔗 Server URL: http://localhost:${PORT}`);
      console.log(`   📊 API Docs: http://localhost:${PORT}/api`);
      console.log(`   ⚡ Rate Limit: 50,000,000 requests/minute`);
      console.log(`   🗄️  Database: Connected`);
      console.log(`   ✅ Status: Running`);
      console.log('   ========================================\n');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('❌ Server error:', error);

      if (error.code === 'EADDRINUSE') {
        console.error(`   💡 Port ${PORT} is already in use`);
        console.error(`   💡 Try: kill -9 $(lsof -ti:${PORT}) or use a different port`);
      } else if (error.code === 'EACCES') {
        console.error(`   💡 Permission denied for port ${PORT}`);
        console.error(`   💡 Try using a port number above 1024`);
      }

      process.exit(1);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

      try {
        // Close server
        server.close(() => {
          console.log('✅ HTTP server closed');
        });

        // Close database connection
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
      console.error('   Error:', error.name, error.message);
      console.error('   Stack:', error.stack);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('❌ UNHANDLED REJECTION! Shutting down...');
      console.error('   Reason:', reason);
      console.error('   Promise:', promise);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// -----------------------------------------------------------------------------
// 🎬 Start the Application
// -----------------------------------------------------------------------------
if (require.main === module) {
  startServer().catch((error) => {
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  });
}

// Export for testing
export default app;

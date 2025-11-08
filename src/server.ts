import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

// Load environment variables
dotenv.config();

// -----------------------------------------------------------------------------
// 🔧 Configuration
// -----------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dominica-news';
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🎬 Starting Dominica News Backend...');
console.log(`   Environment: ${NODE_ENV}`);
console.log(`   Port: ${PORT}`);
console.log(`   Node: ${process.version}`);

// -----------------------------------------------------------------------------
// 🗄️ Database Connection
// -----------------------------------------------------------------------------
const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Suppress mongoose warnings
    mongoose.set('strictQuery', false);
    
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      minPoolSize: 10,
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Handle MongoDB connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      // Don't exit - just log the error
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('⚠️  Server will continue without database connection');
    // Don't exit - let the server run even if MongoDB fails
  }
};

// -----------------------------------------------------------------------------
// 🚀 Server Startup
// -----------------------------------------------------------------------------
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 ========================================');
      console.log(`   Server running on port ${PORT}`);
      console.log(`   Environment: ${NODE_ENV}`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log('   ========================================\n');
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
      
      // Give ongoing requests time to complete
      setTimeout(() => {
        server.close(async () => {
          console.log('✅ Server closed');
          try {
            await mongoose.connection.close();
            console.log('✅ MongoDB closed');
            process.exit(0);
          } catch (error) {
            console.error('Error closing MongoDB:', error);
            process.exit(1);
          }
        });
      }, 1000); // Wait 1 second before closing
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      // Don't exit - log and continue
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit - log and continue
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;

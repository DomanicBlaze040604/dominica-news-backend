import app from './app';
import { config } from './config/config';
import { connectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Starting Dominica News backend server...');

    // ✅ Connect to MongoDB
    await connectDatabase();
    console.log('✅ Database connection established.');

    // ✅ Determine the port (Railway auto-assigns PORT)
    const port: number = Number(process.env.PORT) || Number(config.port) || 8080;

    // ✅ Start the Express server
    const server = app.listen(port, () => {
      console.log(`🚀 Dominica News API running in ${config.nodeEnv} mode on port ${port}`);
    });

    // ✅ Handle graceful shutdown signals
    const gracefulShutdown = (signal: string) => {
      console.log(`⚠️ Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('🛑 Server closed. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ✅ Handle uncaught errors properly
    process.on('unhandledRejection', (err: any) => {
      console.error('❌ Unhandled Promise Rejection:', err);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err: Error) => {
      console.error('❌ Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (error) {
    console.error('🚨 Failed to start server:', error instanceof Error ? error.message : error);
    console.error('💡 Check if MONGODB_URI is valid and network access is open.');
    process.exit(1);
  }
};

startServer();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { corsOptions, rateLimiter, helmetConfig, sanitizeInput, securityHeaders } from './middleware/security';
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import { authRoutes } from './routes/auth';
import { categoryRoutes } from './routes/categories';
import { articleRoutes } from './routes/articles';
import { adminRoutes } from './routes/admin';
import { imageRoutes } from './routes/images';
import healthRoutes from './routes/health';
import { debugRoutes } from './routes/debug';
import { testDbRoutes } from './routes/test-db';
import { seedRoutes } from './routes/seed';

const app = express();

// ✅ 1. CORS configuration — Allow all origins (for now)
app.use(
  cors({
    origin: '*', // Allow all origins — you can restrict this later to your production domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ 2. Security middleware
app.use(helmetConfig);
app.use(securityHeaders);
app.use(rateLimiter);
app.use(sanitizeInput);

// ✅ 3. Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ 4. Static file serving (optional, for images or uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ 5. Root route for Railway & uptime monitoring
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 Dominica News API is live!',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// ✅ 6. API routes
app.use('/api', healthRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/test', testDbRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);

// ✅ 7. Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;

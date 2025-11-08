import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import responseTime from 'response-time';
import path from 'path';

// Import routes
import { authRoutes } from './routes/auth';
import { articleRoutes } from './routes/articles';
import { authorRoutes } from './routes/authors';
import { categoryRoutes } from './routes/categories';
import { settingsRoutes } from './routes/settings';
import { imageRoutes } from './routes/images';
import { breakingNewsRoutes } from './routes/breaking-news';
import { staticPageRoutes } from './routes/staticPages';
import { adminRoutes } from './routes/admin';
import { userRoutes } from './routes/users';
import sitemapRoutes from './routes/sitemap';
import { healthRoutes } from './routes/health';
import { errorRoutes } from './routes/errors';
import { recycleBinRoutes } from './routes/recycleBin';
import { analyticsRoutes } from './routes/analytics';
import { tagRoutes } from './routes/tags';
import { mediaRoutes } from './routes/media';
import { errorHandler } from './middleware/errorHandler';
import { checkMaintenanceMode } from './middleware/maintenance';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger, slowRequestLogger } from './middleware/requestLogger';

// Load env
dotenv.config();

const app: Application = express();

// -----------------------------------------------------------------------------
// 🔧 Trust Proxy (for Railway/production)
// -----------------------------------------------------------------------------
app.set('trust proxy', 1);

// -----------------------------------------------------------------------------
// 🛡️ Security
// -----------------------------------------------------------------------------
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// -----------------------------------------------------------------------------
// 🌍 CORS Configuration for Dominica News
// -----------------------------------------------------------------------------
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Development
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      // Production
      'https://dominicanews.dm',
      'https://www.dominicanews.dm',
      // Vercel deployments
      'https://dominicanews.vercel.app',
      'https://dominica-news-frontend0000001.vercel.app',
      'https://dominicanews-d2aa9.web.app',
      // Firebase hosting
      'https://dominicanews-d2aa9.firebaseapp.com',
    ];
    
    // Allow all Vercel preview deployments
    if (origin.includes('.vercel.app') || origin.includes('dominicanews')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Forwarded-For',
    'X-Real-IP',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar', 'Access-Control-Allow-Origin'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Add CORS request logging for debugging
app.use((req, res, next) => {
  console.log(`CORS Request: ${req.method} ${req.url} from ${req.get('Origin') || 'no-origin'}`);
  next();
});

// -----------------------------------------------------------------------------
// ⚙️ Rate Limiting - 50 Million Requests Per Minute
// -----------------------------------------------------------------------------
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 50000000, // 50,000,000 requests per minute (extremely generous)
  message: { success: false, message: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.path.startsWith('/api/health') ||
    req.path.startsWith('/api/articles') ||
    req.path.startsWith('/api/categories') ||
    req.path.startsWith('/api/static-pages') ||
    req.path.startsWith('/api/authors') ||
    req.path.startsWith('/api/images'),
});
app.use(limiter);

// -----------------------------------------------------------------------------
// ⚡ Middleware
// -----------------------------------------------------------------------------
app.use(requestIdMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(responseTime());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
  app.use(requestLogger);
  app.use(slowRequestLogger(2000)); // Log requests slower than 2 seconds
}

// -----------------------------------------------------------------------------
// 🔍 Admin Panel Debugging Middleware
// -----------------------------------------------------------------------------
app.use('/api/admin', (req, res, next) => {
  console.log(`🔐 Admin Request: ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.get('Origin') || 'no-origin'}`);
  console.log(`   Auth: ${req.get('Authorization') ? 'Present' : 'Missing'}`);
  console.log(`   Content-Type: ${req.get('Content-Type') || 'not-set'}`);
  next();
});

// Log successful responses for admin endpoints
app.use('/api/admin', (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`📤 Admin Response: ${req.method} ${req.url} - Status: ${res.statusCode}`);
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (parsed.success && parsed.data && Array.isArray(parsed.data)) {
          console.log(`   Data Count: ${parsed.data.length} items`);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
    return originalSend.call(this, data);
  };
  next();
});

// -----------------------------------------------------------------------------
// 🖼️ Static Files
// -----------------------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// -----------------------------------------------------------------------------
// 🛡️ Maintenance Mode Check
// -----------------------------------------------------------------------------
app.use(checkMaintenanceMode);

// -----------------------------------------------------------------------------
// 🚏 API Routes
// -----------------------------------------------------------------------------

// ✅ Admin route aliases (frontend expects /api/admin/...) - MOVED TO TOP
console.log('Registering admin routes...');

// Test admin endpoint
app.get('/api/admin/test', (req, res) => {
  console.log('Admin test endpoint hit!');
  res.json({ success: true, message: 'Admin test endpoint working' });
});

app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/articles', articleRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/authors', authorRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/images', imageRoutes);
app.use('/api/admin/breaking-news', breakingNewsRoutes);
app.use('/api/admin/static-pages', staticPageRoutes);
app.use('/api/admin/recycle-bin', recycleBinRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/tags', tagRoutes);
app.use('/api/admin/media', mediaRoutes);
console.log('Admin routes registered successfully');

// Regular API routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

// Frontend compatibility aliases
app.use('/api/pages', staticPageRoutes); // Alias for static-pages
app.use('/api/admin/pages', staticPageRoutes); // Admin alias for pages

// Health check and error reporting routes
app.use('/api/health', healthRoutes);
app.use('/api/errors', errorRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/breaking-news', breakingNewsRoutes);
app.use('/api/static-pages', staticPageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recycle-bin', recycleBinRoutes);
app.use('/api/tags', tagRoutes);

// Sitemap routes (served at root level)
app.use('/', sitemapRoutes);

// -----------------------------------------------------------------------------
// 🏠 Root
// -----------------------------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    app: 'Dominica News API',
    version: '2.0.0',
    domain: 'https://dominicanews.dm',
    status: 'running ✅',
  });
});

// -----------------------------------------------------------------------------
// ❌ 404
// -----------------------------------------------------------------------------
app.use('*', (req: Request, res: Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: `Not found - ${req.originalUrl}` });
});

// -----------------------------------------------------------------------------
// 🧱 Global Error Handler
// -----------------------------------------------------------------------------
app.use(errorHandler);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 Unexpected Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
  });
});

export default app;

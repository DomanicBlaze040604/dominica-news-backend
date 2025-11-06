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
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';

// Load env
dotenv.config();

const app: Application = express();

// -----------------------------------------------------------------------------
// 🛡️ Security
// -----------------------------------------------------------------------------
app.use(helmet({ crossOriginResourcePolicy: false }));

// -----------------------------------------------------------------------------
// 🌍 CORS Configuration for Dominica News
// -----------------------------------------------------------------------------
const corsOptions = {
  origin: [
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
    // Add environment variable origins
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
  ],
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
    'X-Real-IP'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
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
// ⚙️ Rate Limiting
// -----------------------------------------------------------------------------
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5000,
  message: { success: false, message: 'Rate limit exceeded. Please slow down.' },
  skip: (req) =>
    req.path.startsWith('/api/health') ||
    req.path.startsWith('/api/articles') ||
    req.path.startsWith('/api/categories'),
});
app.use(limiter);

// -----------------------------------------------------------------------------
// ⚡ Middleware
// -----------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(responseTime());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

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
// 🚏 API Routes
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/breaking-news', breakingNewsRoutes);
app.use('/api/static-pages', staticPageRoutes);
app.use('/api/health', healthRoutes);

// ✅ Admin route aliases (frontend expects /api/admin/...)
app.use('/api/admin/articles', articleRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/authors', authorRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/images', imageRoutes);
app.use('/api/admin/breaking-news', breakingNewsRoutes);
app.use('/api/admin/static-pages', staticPageRoutes);

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
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
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

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { categoryRoutes } from './routes/categories';
import { breakingNewsRoutes } from './routes/breaking-news';
import { articleRoutes } from './routes/articles';
import { staticPageRoutes } from './routes/staticPages';
import { handleValidationErrors, notFoundHandler, globalErrorHandler } from './middleware/errorHandler';

// -----------------------------------------------------------------------------
// ⚙️ Initialize Express
// -----------------------------------------------------------------------------
const app: Application = express();

// ✅ FIX for Railway / Render / Vercel proxy environments
app.set('trust proxy', 1);

// -----------------------------------------------------------------------------
// 🛡️ Security & Optimization Middlewares
// -----------------------------------------------------------------------------
app.use(helmet()); // Protects HTTP headers
app.use(compression()); // Gzip compression
app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// -----------------------------------------------------------------------------
// 🌐 CORS Configuration
// -----------------------------------------------------------------------------
const allowedOrigins = [
  'https://www.dominicanews.dm',
  'https://dominicanews.dm',
  'http://localhost:3000', // local dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// -----------------------------------------------------------------------------
// 📊 Logging Middleware
// -----------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// -----------------------------------------------------------------------------
// 🚦 Rate Limiting (with fix for proxy header validation)
// -----------------------------------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false, // ✅ prevents crash if trust proxy misbehaves
  },
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please try again later.',
    });
  },
});

app.use('/api', apiLimiter);

// -----------------------------------------------------------------------------
// 📁 Static File Serving (for uploads, public assets, etc.)
// -----------------------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// -----------------------------------------------------------------------------
// 🚀 API Routes
// -----------------------------------------------------------------------------
app.use('/api/categories', categoryRoutes);
app.use('/api/breaking-news', breakingNewsRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/pages', staticPageRoutes);

// -----------------------------------------------------------------------------
// 🩺 Health Check Endpoint
// -----------------------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// -----------------------------------------------------------------------------
// ❌ 404 Not Found Handler
// -----------------------------------------------------------------------------
app.use(notFoundHandler);

// -----------------------------------------------------------------------------
// 🧱 Global Error Handler
// -----------------------------------------------------------------------------
app.use(globalErrorHandler);

// -----------------------------------------------------------------------------
// 🧭 Default Route
// -----------------------------------------------------------------------------
app.get('/', (req: Request, res: Response) => {
  res.status(200).send(`
    <h2>Dominica News API</h2>
    <p>Status: <strong>Running ✅</strong></p>
    <p>Environment: ${process.env.NODE_ENV}</p>
    <p>Version: 1.0.0</p>
  `);
});

// -----------------------------------------------------------------------------
// ✅ Export app for server.ts
// -----------------------------------------------------------------------------
export default app;

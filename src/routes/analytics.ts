import express from 'express';
import {
  getDashboardAnalytics,
  getArticleAnalytics,
  getCategoryAnalytics,
  getAuthorAnalytics,
  trackPageView
} from '../controllers/analyticsController';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Public route for tracking views
router.post('/track/view', trackPageView);

// Admin routes
router.get('/dashboard', authenticate, requireAdmin, getDashboardAnalytics);
router.get('/article/:id', authenticate, requireAdmin, getArticleAnalytics);
router.get('/category/:id', authenticate, requireAdmin, getCategoryAnalytics);
router.get('/author/:id', authenticate, requireAdmin, getAuthorAnalytics);

export { router as analyticsRoutes };

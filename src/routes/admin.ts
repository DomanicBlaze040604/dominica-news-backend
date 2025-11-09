import express from 'express';
import { validateSlug, seedAuthors, seedStaticPages } from '../controllers/adminController';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';
import { publishScheduledArticles } from '../services/scheduledPublisher';

const router = express.Router();

// Editor and Admin routes
router.get('/validate-slug', authenticate, requireEditor, validateSlug);

// Admin-only routes
router.post('/seed-authors', authenticate, requireAdmin, seedAuthors);
router.post('/seed-static-pages', authenticate, requireAdmin, seedStaticPages);

// Manually trigger scheduled article publishing
router.post('/publish-scheduled', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await publishScheduledArticles();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error publishing scheduled articles',
      error: error.message
    });
  }
});

export { router as adminRoutes };
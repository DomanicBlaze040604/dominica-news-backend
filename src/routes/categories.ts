import express, { Request, Response, NextFunction } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  checkSlugAvailability,
  getCategoryPreview,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryArticlesCount,
  getCategoryArticlesAdmin
} from '../controllers/categoryController';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';
import { validateCategory } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = express.Router();

// -----------------------------
// 🔓 Public routes
// -----------------------------
router.get('/', getCategories);
router.get('/check-slug/:slug', checkSlugAvailability);

// Must come before generic /:slug
router.get('/:slug/preview', getCategoryPreview);

// Fetch category articles by slug dynamically
router.get('/:slug/articles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getCategoryArticlesBySlug } = await import('../controllers/categoryController');

    // Clone request with modified params
    const modifiedReq = {
      ...req,
      params: {
        ...req.params,
        categorySlug: req.params.slug
      }
    };

    // ✅ Pass next argument to match controller signature
    return getCategoryArticlesBySlug(modifiedReq as any, res, next);
  } catch (error) {
    console.error('Category articles error:', error);
    next(error);
  }
});

// Generic slug route (must be last among slug-based)
router.get('/:slug', getCategoryBySlug);

// -----------------------------
// 🔒 Protected routes (Editor)
// -----------------------------
router.post(
  '/',
  authenticate,
  requireEditor,
  validateCategory,
  handleValidationErrors,
  createCategory
);

router.put(
  '/:id',
  authenticate,
  requireEditor,
  validateCategory,
  handleValidationErrors,
  updateCategory
);

// -----------------------------
// 🛠️ Admin / Editor routes
// -----------------------------
router.get(
  '/admin/:id/articles-count',
  authenticate,
  requireEditor,
  getCategoryArticlesCount
);

router.get(
  '/admin/:id/articles',
  authenticate,
  requireEditor,
  getCategoryArticlesAdmin
);

// -----------------------------
// 🚫 Admin-only route
// -----------------------------
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export { router as categoryRoutes };

import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  checkSlugAvailability,
  getCategoryPreview,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';
import { validateCategory } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/check-slug/:slug', checkSlugAvailability);
router.get('/:slug/preview', getCategoryPreview);
router.get('/:slug/articles', async (req, res) => {
  try {
    // Import the function here to avoid circular dependency
    const { getCategoryArticles } = await import('../controllers/articleController');
    // Map the slug parameter to categorySlug for the function
    req.params.categorySlug = req.params.slug;
    return getCategoryArticles(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get category articles' });
  }
});
router.get('/:slug', getCategoryBySlug);

// Protected routes - Editors can create and edit categories
router.post('/', authenticate, requireEditor, validateCategory, handleValidationErrors, createCategory);
router.put('/:id', authenticate, requireEditor, validateCategory, handleValidationErrors, updateCategory);

// Admin-only routes - Only admins can delete categories
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export { router as categoryRoutes };
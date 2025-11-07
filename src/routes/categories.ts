import express from 'express';
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

// Public routes
router.get('/', getCategories);
router.get('/check-slug/:slug', checkSlugAvailability);

// Specific routes must come before generic /:slug route
router.get('/:slug/preview', getCategoryPreview);
// Import the function directly
import { getCategoryArticlesBySlug } from '../controllers/categoryController';
router.get('/:slug/articles', getCategoryArticlesBySlug);

// Generic slug route must be last
router.get('/:slug', getCategoryBySlug);

// Protected routes - Editors can create and edit categories
router.post('/', authenticate, requireEditor, validateCategory, handleValidationErrors, createCategory);
router.put('/:id', authenticate, requireEditor, validateCategory, handleValidationErrors, updateCategory);

// Admin routes for category article management
router.get('/:id/articles-count', authenticate, requireEditor, getCategoryArticlesCount);
router.get('/:id/articles-admin', authenticate, requireEditor, getCategoryArticlesAdmin);

// Admin-only routes - Only admins can delete categories
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export { router as categoryRoutes };
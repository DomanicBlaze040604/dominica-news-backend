import express from 'express';
import {
  getStaticPages,
  getStaticPagesAdmin,
  getStaticPageBySlug,
  getStaticPageById,
  createStaticPage,
  updateStaticPage,
  deleteStaticPage,
  togglePageStatus,
  getMenuPages,
  reorderMenuPages,
  getEditorialTeamPage
} from '../controllers/staticPageController';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';
import { validateStaticPage } from '../middleware/validation';

const router = express.Router();

// Public routes
router.get('/', getStaticPages);
router.get('/menu', getMenuPages);
router.get('/editorial-team', getEditorialTeamPage);

// Admin routes (when mounted at /api/admin/pages or /api/admin/static-pages)
// These routes work for both /api/pages and /api/admin/pages mounting
router.get('/admin', authenticate, requireEditor, getStaticPagesAdmin);
router.post('/admin', authenticate, requireEditor, validateStaticPage, createStaticPage);
router.put('/reorder', authenticate, requireAdmin, reorderMenuPages);

// ID-based routes (admin only - must come before slug route)
router.get('/id/:id', authenticate, requireEditor, getStaticPageById);
router.put('/:id', authenticate, requireEditor, updateStaticPage);
router.patch('/:id/toggle-status', authenticate, requireEditor, togglePageStatus);
router.delete('/:id', authenticate, requireAdmin, deleteStaticPage);

// Slug route (public - must be LAST to not catch other routes)
router.get('/:slug', getStaticPageBySlug);

export { router as staticPageRoutes };
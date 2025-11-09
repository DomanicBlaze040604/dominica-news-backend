import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getAllRecycleBinItems,
  getRecycleBinItemsByType,
  restoreItem,
  permanentlyDeleteItem,
  emptyRecycleBin,
  emptyRecycleBinByType
} from '../controllers/recycleBinController';

const router = express.Router();

// Get all items in recycle bin
router.get('/', authenticate, requireAdmin, getAllRecycleBinItems);

// Empty entire recycle bin (must be before /:type routes)
router.delete('/empty', authenticate, requireAdmin, emptyRecycleBin);

// Get items by type
router.get('/:type', authenticate, requireAdmin, getRecycleBinItemsByType);

// Empty by type
router.delete('/:type/empty', authenticate, requireAdmin, emptyRecycleBinByType);

// Restore an item
router.post('/:type/:id/restore', authenticate, requireAdmin, restoreItem);

// Permanently delete an item
router.delete('/:type/:id', authenticate, requireAdmin, permanentlyDeleteItem);

export { router as recycleBinRoutes };

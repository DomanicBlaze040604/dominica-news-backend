import express from 'express';
import {
  getRecycleBinItems,
  restoreItem,
  permanentlyDelete,
  emptyRecycleBin,
  getRecycleBinStats
} from '../controllers/recycleBinController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All recycle bin routes require admin authentication
router.use(authenticate, requireAdmin);

// Get all items in recycle bin
router.get('/', getRecycleBinItems);

// Get recycle bin stats
router.get('/stats', getRecycleBinStats);

// Restore item from recycle bin
router.post('/:id/restore', restoreItem);

// Permanently delete item
router.delete('/:id', permanentlyDelete);

// Empty recycle bin (delete all expired items)
router.post('/empty', emptyRecycleBin);

export { router as recycleBinRoutes };

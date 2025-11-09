import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Mock recycle bin endpoints - returns empty data for now
// This prevents 404 errors while keeping the UI functional

// Get all items in recycle bin
router.get('/', authenticate, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Get items by type
router.get('/:type', authenticate, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Restore an item
router.post('/:type/:id/restore', authenticate, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Item restored successfully'
  });
});

// Permanently delete an item
router.delete('/:type/:id', authenticate, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Item permanently deleted'
  });
});

// Empty entire recycle bin
router.delete('/empty', authenticate, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Recycle bin emptied'
  });
});

// Empty by type
router.delete('/:type/empty', authenticate, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: `${req.params.type} recycle bin emptied`
  });
});

export { router as recycleBinRoutes };

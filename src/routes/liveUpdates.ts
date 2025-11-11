import express from 'express';
import {
  getLiveUpdates,
  getLiveUpdateById,
  getActiveLiveUpdates,
  createLiveUpdate,
  addUpdate,
  updateLiveUpdate,
  deleteLiveUpdate,
  getLiveUpdatesByType
} from '../controllers/liveUpdateController';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getLiveUpdates);
router.get('/active', getActiveLiveUpdates);
router.get('/type/:type', getLiveUpdatesByType);
router.get('/:id', getLiveUpdateById);

// Protected routes - Editors and Admins
router.post('/', authenticate, createLiveUpdate);
router.post('/:id/updates', authenticate, addUpdate);
router.put('/:id', authenticate, updateLiveUpdate);

// Admin only
router.delete('/:id', authenticate, deleteLiveUpdate);

export { router as liveUpdateRoutes };

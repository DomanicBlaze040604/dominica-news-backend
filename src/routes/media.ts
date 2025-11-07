import express from 'express';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';

const router = express.Router();

// Temporary in-memory storage for media metadata (replace with database in production)
let mediaFiles: any[] = [];

// Get all media files
router.get('/', authenticate, requireEditor, async (req, res) => {
  try {
    res.json({
      success: true,
      data: mediaFiles
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media files'
    });
  }
});

// Get single media file
router.get('/:id', authenticate, requireEditor, async (req, res) => {
  try {
    const media = mediaFiles.find(m => m.id === req.params.id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }
    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch media file'
    });
  }
});

// Update media metadata
router.put('/:id', authenticate, requireEditor, async (req, res) => {
  try {
    const mediaIndex = mediaFiles.findIndex(m => m.id === req.params.id);
    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    const { name, alt } = req.body;
    
    mediaFiles[mediaIndex] = {
      ...mediaFiles[mediaIndex],
      ...(name && { name }),
      ...(alt !== undefined && { alt }),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mediaFiles[mediaIndex],
      message: 'Media updated successfully'
    });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update media'
    });
  }
});

// Delete media file
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const mediaIndex = mediaFiles.findIndex(m => m.id === req.params.id);
    if (mediaIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    mediaFiles.splice(mediaIndex, 1);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media'
    });
  }
});

export { router as mediaRoutes };

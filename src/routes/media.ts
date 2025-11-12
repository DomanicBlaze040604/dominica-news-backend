import express from 'express';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';
import Media from '../models/Media';

const router = express.Router();

// Helper function to add media file to database
export const addMediaFile = async (fileData: {
  name: string;
  originalName: string;
  url: string;
  type?: string;
  mimeType?: string;
  size: number; // in bytes
  dimensions?: { width: number; height: number };
  alt?: string;
  uploadedBy?: string;
}) => {
  try {
    const mediaFile = new Media({
      name: fileData.name,
      originalName: fileData.originalName,
      url: fileData.url,
      type: fileData.type || 'image',
      mimeType: fileData.mimeType,
      size: fileData.size,
      dimensions: fileData.dimensions,
      alt: fileData.alt || fileData.originalName,
      uploadedBy: fileData.uploadedBy,
      uploadedAt: new Date(),
      updatedAt: new Date()
    });
    
    await mediaFile.save();
    return mediaFile;
  } catch (error) {
    console.error('Error saving media to database:', error);
    throw error;
  }
};

// Get all media files
router.get('/', authenticate, requireEditor, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, search } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [mediaFiles, total] = await Promise.all([
      Media.find(query)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('uploadedBy', 'name email'),
      Media.countDocuments(query)
    ]);
    
    // Format the response to match frontend expectations
    const formattedMedia = mediaFiles.map(media => ({
      id: media.id,
      name: media.name,
      url: media.url,
      type: media.type,
      size: `${(media.size / 1024).toFixed(2)} KB`,
      dimensions: media.dimensions 
        ? `${media.dimensions.width}x${media.dimensions.height}` 
        : 'Unknown',
      alt: media.alt,
      uploadedAt: media.uploadedAt,
      updatedAt: media.updatedAt
    }));
    
    res.json({
      success: true,
      data: formattedMedia,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
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
    const media = await Media.findById(req.params.id).populate('uploadedBy', 'name email');
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: media.id,
        name: media.name,
        url: media.url,
        type: media.type,
        size: `${(media.size / 1024).toFixed(2)} KB`,
        dimensions: media.dimensions 
          ? `${media.dimensions.width}x${media.dimensions.height}` 
          : 'Unknown',
        alt: media.alt,
        uploadedAt: media.uploadedAt,
        updatedAt: media.updatedAt
      }
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
    const { name, alt, description } = req.body;
    
    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (alt !== undefined) updateData.alt = alt;
    if (description !== undefined) updateData.description = description;
    
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: media.id,
        name: media.name,
        url: media.url,
        type: media.type,
        size: `${(media.size / 1024).toFixed(2)} KB`,
        dimensions: media.dimensions 
          ? `${media.dimensions.width}x${media.dimensions.height}` 
          : 'Unknown',
        alt: media.alt,
        uploadedAt: media.uploadedAt,
        updatedAt: media.updatedAt
      },
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
    const media = await Media.findByIdAndDelete(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    // TODO: Also delete the actual file from storage
    // This would require implementing file deletion logic

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

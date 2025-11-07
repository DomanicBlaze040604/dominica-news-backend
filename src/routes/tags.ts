import express from 'express';
import { authenticate, requireAdmin, requireEditor } from '../middleware/auth';

const router = express.Router();

// Temporary in-memory storage for tags (replace with database in production)
let tags: any[] = [
  {
    id: '1',
    name: 'Politics',
    slug: 'politics',
    description: 'Political news and updates',
    color: '#3B82F6',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Breaking',
    slug: 'breaking',
    description: 'Breaking news stories',
    color: '#EF4444',
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get all tags
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags'
    });
  }
});

// Get single tag by ID
router.get('/:id', async (req, res) => {
  try {
    const tag = tags.find(t => t.id === req.params.id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tag'
    });
  }
});

// Create new tag (admin)
router.post('/', authenticate, requireEditor, async (req, res) => {
  try {
    const { name, slug, description, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: 'Name and color are required'
      });
    }

    const newTag = {
      id: String(tags.length + 1),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      color,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tags.push(newTag);

    res.status(201).json({
      success: true,
      data: newTag,
      message: 'Tag created successfully'
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tag'
    });
  }
});

// Update tag (admin)
router.put('/:id', authenticate, requireEditor, async (req, res) => {
  try {
    const tagIndex = tags.findIndex(t => t.id === req.params.id);
    if (tagIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    const { name, slug, description, color } = req.body;
    
    tags[tagIndex] = {
      ...tags[tagIndex],
      ...(name && { name }),
      ...(slug && { slug }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: tags[tagIndex],
      message: 'Tag updated successfully'
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tag'
    });
  }
});

// Delete tag (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const tagIndex = tags.findIndex(t => t.id === req.params.id);
    if (tagIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    tags.splice(tagIndex, 1);

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tag'
    });
  }
});

export { router as tagRoutes };

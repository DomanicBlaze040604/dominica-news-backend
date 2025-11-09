import { Request, Response } from 'express';
import { BreakingNews } from '../models/BreakingNews';
import { addToRecycleBin } from './recycleBinController';

export const breakingNewsController = {
  // Get active breaking news (public)
  getActive: async (req: Request, res: Response) => {
    try {
      const activeNews = await BreakingNews.getActive();

      res.json({
        success: true,
        data: activeNews
      });
    } catch (error) {
      console.error('Error fetching active breaking news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active breaking news'
      });
    }
  },

  // Get all breaking news with pagination (admin)
  getAll: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [breakingNews, totalItems] = await Promise.all([
        BreakingNews.find()
          .populate('createdBy', 'fullName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        BreakingNews.countDocuments()
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        success: true,
        data: {
          breakingNews,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch breaking news'
      });
    }
  },

  // Create breaking news (admin)
  create: async (req: Request, res: Response) => {
    try {
      const { title, link, priority = 'high', isActive = false } = req.body;

      if (!title || title.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Breaking news title must be at least 5 characters long'
        });
      }

      if (title.length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Breaking news title cannot exceed 200 characters'
        });
      }

      // If this breaking news is being set as active, deactivate all others
      if (isActive) {
        await BreakingNews.deactivateAll();
      }

      const breakingNews = new BreakingNews({
        title: title.trim(),
        link: link?.trim(),
        priority,
        isActive,
        createdBy: req.user!.id
      });

      await breakingNews.save();
      await breakingNews.populate('createdBy', 'fullName email');

      res.status(201).json({
        success: true,
        data: breakingNews,
        message: 'Breaking news created successfully'
      });
    } catch (error) {
      console.error('Error creating breaking news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create breaking news'
      });
    }
  },

  // Update breaking news (admin)
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, link, priority, isActive } = req.body;

      const breakingNews = await BreakingNews.findById(id);
      if (!breakingNews) {
        return res.status(404).json({
          success: false,
          message: 'Breaking news not found'
        });
      }

      // Validate title if provided
      if (title !== undefined) {
        if (!title || title.trim().length < 5) {
          return res.status(400).json({
            success: false,
            message: 'Breaking news title must be at least 5 characters long'
          });
        }

        if (title.length > 200) {
          return res.status(400).json({
            success: false,
            message: 'Breaking news title cannot exceed 200 characters'
          });
        }

        breakingNews.title = title.trim();
      }

      // Update link if provided
      if (link !== undefined) {
        breakingNews.link = link?.trim();
      }

      // Update priority if provided
      if (priority !== undefined) {
        breakingNews.priority = priority;
      }

      // Handle activation/deactivation
      if (isActive !== undefined) {
        if (isActive) {
          // If activating this breaking news, deactivate all others first
          await BreakingNews.deactivateAll();
        }
        breakingNews.isActive = isActive;
      }

      await breakingNews.save();
      await breakingNews.populate('createdBy', 'fullName email');

      res.json({
        success: true,
        data: breakingNews,
        message: 'Breaking news updated successfully'
      });
    } catch (error) {
      console.error('Error updating breaking news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update breaking news'
      });
    }
  },

  // Delete breaking news (admin)
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const breakingNews = await BreakingNews.findById(id);
      if (!breakingNews) {
        return res.status(404).json({
          success: false,
          message: 'Breaking news not found'
        });
      }

      // Move to recycle bin before deleting
      await addToRecycleBin(
        'breaking-news',
        breakingNews._id,
        breakingNews.title,
        breakingNews.toObject(),
        req.user!.id
      );

      await BreakingNews.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Breaking news deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting breaking news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete breaking news'
      });
    }
  },

  // Toggle active status (admin)
  toggleActive: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const breakingNews = await BreakingNews.findById(id);
      if (!breakingNews) {
        return res.status(404).json({
          success: false,
          message: 'Breaking news not found'
        });
      }

      if (!breakingNews.isActive) {
        // If activating, use the static method to ensure constraint
        const activatedNews = await BreakingNews.setActive(id);
        return res.json({
          success: true,
          data: activatedNews,
          message: 'Breaking news activated successfully'
        });
      } else {
        // If deactivating, just set to false
        breakingNews.isActive = false;
      }

      await breakingNews.save();
      await breakingNews.populate('createdBy', 'fullName email');

      res.json({
        success: true,
        data: breakingNews,
        message: `Breaking news ${breakingNews.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling breaking news status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle breaking news status'
      });
    }
  }
};
import { Request, Response } from 'express';
import { RecycleBin } from '../models/RecycleBin';
import Article from '../models/Article';
import { Category } from '../models/Category';
import Author from '../models/Author';
import { StaticPage } from '../models/StaticPage';
import { asyncHandler } from '../middleware/errorHandler';
import mongoose from 'mongoose';

// Get all items in recycle bin
export const getRecycleBinItems = asyncHandler(async (req: Request, res: Response) => {
  const { itemType, page = 1, limit = 20 } = req.query;

  const query: any = {};
  if (itemType) {
    query.itemType = itemType;
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    RecycleBin.find(query)
      .populate('deletedBy', 'fullName email')
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    RecycleBin.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }
  });
});

// Restore item from recycle bin
export const restoreItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const recycleBinItem = await RecycleBin.findById(id);
  if (!recycleBinItem) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in recycle bin'
    });
  }

  if (!recycleBinItem.canRestore) {
    return res.status(400).json({
      success: false,
      message: 'This item cannot be restored'
    });
  }

  let restoredItem;
  const itemData = recycleBinItem.itemData;

  try {
    // Restore based on item type
    switch (recycleBinItem.itemType) {
      case 'article':
        restoredItem = await Article.create(itemData);
        break;
      case 'category':
        restoredItem = await Category.create(itemData);
        break;
      case 'author':
        restoredItem = await Author.create(itemData);
        break;
      case 'staticPage':
        restoredItem = await StaticPage.create(itemData);
        break;
      default:
        throw new Error('Unknown item type');
    }

    // Remove from recycle bin
    await RecycleBin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `${recycleBinItem.itemType} restored successfully`,
      data: { restoredItem }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: `Failed to restore item: ${error.message}`
    });
  }
});

// Permanently delete item from recycle bin
export const permanentlyDelete = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const recycleBinItem = await RecycleBin.findByIdAndDelete(id);
  if (!recycleBinItem) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in recycle bin'
    });
  }

  res.json({
    success: true,
    message: 'Item permanently deleted'
  });
});

// Empty recycle bin (delete all expired items)
export const emptyRecycleBin = asyncHandler(async (req: Request, res: Response) => {
  const result = await RecycleBin.deleteMany({
    expiresAt: { $lte: new Date() }
  });

  res.json({
    success: true,
    message: `Deleted ${result.deletedCount} expired items`,
    data: { deletedCount: result.deletedCount }
  });
});

// Get recycle bin stats
export const getRecycleBinStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await RecycleBin.aggregate([
    {
      $group: {
        _id: '$itemType',
        count: { $sum: 1 },
        oldestItem: { $min: '$deletedAt' },
        newestItem: { $max: '$deletedAt' }
      }
    }
  ]);

  const total = await RecycleBin.countDocuments();
  const expiringSoon = await RecycleBin.countDocuments({
    expiresAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
  });

  res.json({
    success: true,
    data: {
      total,
      expiringSoon,
      byType: stats
    }
  });
});

// Helper function to move item to recycle bin
export const moveToRecycleBin = async (
  itemType: 'article' | 'category' | 'author' | 'staticPage',
  itemId: string,
  itemData: any,
  deletedBy: mongoose.Types.ObjectId,
  metadata?: any
) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

  const recycleBinItem = await RecycleBin.create({
    itemType,
    itemId,
    itemData,
    deletedBy,
    expiresAt,
    originalCollection: itemType,
    metadata: metadata || {
      title: itemData.title,
      name: itemData.name,
      slug: itemData.slug,
      status: itemData.status
    }
  });

  return recycleBinItem;
};

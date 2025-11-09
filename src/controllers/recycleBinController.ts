import { Request, Response } from 'express';
import { RecycleBin } from '../models/RecycleBin';
import Article from '../models/Article';
import { Category } from '../models/Category';
import { StaticPage } from '../models/StaticPage';
import { BreakingNews } from '../models/BreakingNews';
import { asyncHandler } from '../middleware/errorHandler';

// Get all items in recycle bin
export const getAllRecycleBinItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await RecycleBin.find()
    .populate('deletedBy', 'fullName email')
    .sort({ deletedAt: -1 });

  res.json({
    success: true,
    data: items.map(item => ({
      id: item.id,
      type: item.itemType,
      title: item.title,
      deletedAt: item.deletedAt,
      deletedBy: item.deletedBy ? (item.deletedBy as any).fullName : 'Unknown',
      expiresAt: item.expiresAt
    }))
  });
});

// Get items by type
export const getRecycleBinItemsByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;

  const items = await RecycleBin.find({ itemType: type })
    .populate('deletedBy', 'fullName email')
    .sort({ deletedAt: -1 });

  res.json({
    success: true,
    data: items.map(item => ({
      id: item.id,
      type: item.itemType,
      title: item.title,
      deletedAt: item.deletedAt,
      deletedBy: item.deletedBy ? (item.deletedBy as any).fullName : 'Unknown',
      expiresAt: item.expiresAt
    }))
  });
});

// Restore an item from recycle bin
export const restoreItem = asyncHandler(async (req: Request, res: Response) => {
  const { type, id } = req.params;

  const recycleBinItem = await RecycleBin.findOne({ _id: id, itemType: type });

  if (!recycleBinItem) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in recycle bin'
    });
  }

  // Restore based on type
  let restored = null;
  switch (type) {
    case 'article':
      restored = await Article.create(recycleBinItem.originalData);
      break;
    case 'category':
      restored = await Category.create(recycleBinItem.originalData);
      break;
    case 'page':
      restored = await StaticPage.create(recycleBinItem.originalData);
      break;
    case 'breaking-news':
      restored = await BreakingNews.create(recycleBinItem.originalData);
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid item type'
      });
  }

  // Remove from recycle bin
  await RecycleBin.findByIdAndDelete(id);

  res.json({
    success: true,
    message: `${type} restored successfully`,
    data: restored
  });
});

// Permanently delete an item
export const permanentlyDeleteItem = asyncHandler(async (req: Request, res: Response) => {
  const { type, id } = req.params;

  const deleted = await RecycleBin.findOneAndDelete({ _id: id, itemType: type });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in recycle bin'
    });
  }

  res.json({
    success: true,
    message: `${type} permanently deleted`
  });
});

// Empty entire recycle bin
export const emptyRecycleBin = asyncHandler(async (req: Request, res: Response) => {
  const result = await RecycleBin.deleteMany({});

  res.json({
    success: true,
    message: `Recycle bin emptied. ${result.deletedCount} items permanently deleted.`
  });
});

// Empty recycle bin by type
export const emptyRecycleBinByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;

  const result = await RecycleBin.deleteMany({ itemType: type });

  res.json({
    success: true,
    message: `${type} recycle bin emptied. ${result.deletedCount} items permanently deleted.`
  });
});

// Helper function to add item to recycle bin (called when deleting items)
export const addToRecycleBin = async (
  itemType: string,
  itemId: any,
  title: string,
  originalData: any,
  deletedBy: any
) => {
  return await RecycleBin.create({
    itemType,
    itemId,
    title,
    originalData,
    deletedBy
  });
};

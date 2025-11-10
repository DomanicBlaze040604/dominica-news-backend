import { Request, Response } from 'express';
import LiveUpdate from '../models/LiveUpdate';
import { toDominicanTime } from '../utils/timezone';

// Get all live updates
export const getLiveUpdates = async (req: Request, res: Response) => {
  try {
    const {
      status = 'active',
      type,
      limit = 10,
      page = 1
    } = req.query;

    const query: any = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [liveUpdates, total] = await Promise.all([
      LiveUpdate.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .populate('updates.author', 'name avatar')
        .sort({ isSticky: -1, priority: -1, startedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      LiveUpdate.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: liveUpdates,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live updates',
      error: error.message
    });
  }
};

// Get single live update by ID
export const getLiveUpdateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const liveUpdate = await LiveUpdate.findById(id)
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color')
      .populate('updates.author', 'name avatar');

    if (!liveUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Live update not found'
      });
    }

    // Increment view count
    await LiveUpdate.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.json({
      success: true,
      data: liveUpdate
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live update',
      error: error.message
    });
  }
};

// Get active live updates for homepage
export const getActiveLiveUpdates = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    const liveUpdates = await LiveUpdate.find({
      status: 'active',
      showOnHomepage: true
    })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .sort({ isSticky: -1, priority: -1, startedAt: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: liveUpdates
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active live updates',
      error: error.message
    });
  }
};

// Create live update
export const createLiveUpdate = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      categoryId,
      authorId,
      tags,
      metadata,
      autoRefresh,
      refreshInterval,
      isSticky,
      showOnHomepage
    } = req.body;

    const liveUpdate = new LiveUpdate({
      title,
      content,
      type: type || 'general',
      priority: priority || 3,
      category: categoryId,
      author: authorId,
      tags: tags || [],
      metadata: metadata || {},
      autoRefresh: autoRefresh !== undefined ? autoRefresh : true,
      refreshInterval: refreshInterval || 30,
      isSticky: isSticky || false,
      showOnHomepage: showOnHomepage !== undefined ? showOnHomepage : true,
      status: 'active',
      startedAt: toDominicanTime(new Date()),
      updates: [{
        timestamp: toDominicanTime(new Date()),
        content,
        author: authorId
      }]
    });

    await liveUpdate.save();
    await liveUpdate.populate(['author', 'category']);

    res.status(201).json({
      success: true,
      message: 'Live update created successfully',
      data: liveUpdate
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating live update',
      error: error.message
    });
  }
};

// Add update to existing live update
export const addUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, authorId, attachments } = req.body;

    const liveUpdate = await LiveUpdate.findById(id);

    if (!liveUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Live update not found'
      });
    }

    if (liveUpdate.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add updates to ended live update'
      });
    }

    liveUpdate.updates.push({
      timestamp: toDominicanTime(new Date()),
      content,
      author: authorId,
      attachments: attachments || []
    } as any);

    await liveUpdate.save();
    await liveUpdate.populate(['author', 'category', 'updates.author']);

    res.json({
      success: true,
      message: 'Update added successfully',
      data: liveUpdate
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error adding update',
      error: error.message
    });
  }
};

// Update live update
export const updateLiveUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If ending the live update, set endedAt
    if (updateData.status === 'ended' && !updateData.endedAt) {
      updateData.endedAt = toDominicanTime(new Date());
    }

    const liveUpdate = await LiveUpdate.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate(['author', 'category', 'updates.author']);

    if (!liveUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Live update not found'
      });
    }

    res.json({
      success: true,
      message: 'Live update updated successfully',
      data: liveUpdate
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating live update',
      error: error.message
    });
  }
};

// Delete live update
export const deleteLiveUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const liveUpdate = await LiveUpdate.findByIdAndDelete(id);

    if (!liveUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Live update not found'
      });
    }

    res.json({
      success: true,
      message: 'Live update deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting live update',
      error: error.message
    });
  }
};

// Get live updates by type
export const getLiveUpdatesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;

    const liveUpdates = await LiveUpdate.find({
      type,
      status: 'active'
    })
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .sort({ priority: -1, startedAt: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: liveUpdates
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live updates by type',
      error: error.message
    });
  }
};

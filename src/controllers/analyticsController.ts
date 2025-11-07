import { Request, Response } from 'express';
import { Analytics } from '../models/Analytics';
import Article from '../models/Article';
import { Category } from '../models/Category';
import Author from '../models/Author';
import { asyncHandler } from '../middleware/errorHandler';
import mongoose from 'mongoose';

// Get dashboard analytics
export const getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { period = '7d' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  // Get site-wide analytics
  const siteAnalytics = await Analytics.aggregate([
    {
      $match: {
        type: 'site',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$metrics.views' },
        totalUniqueViews: { $sum: '$metrics.uniqueViews' },
        totalLikes: { $sum: '$metrics.likes' },
        totalShares: { $sum: '$metrics.shares' },
        totalComments: { $sum: '$metrics.comments' },
        avgReadTime: { $avg: '$metrics.avgReadTime' },
        avgBounceRate: { $avg: '$metrics.bounceRate' }
      }
    }
  ]);

  // Get article counts
  const [totalArticles, publishedArticles, draftArticles] = await Promise.all([
    Article.countDocuments(),
    Article.countDocuments({ status: 'published' }),
    Article.countDocuments({ status: 'draft' })
  ]);

  // Get category count
  const totalCategories = await Category.countDocuments();

  // Get author count
  const totalAuthors = await Author.countDocuments({ isActive: true });

  // Get top articles
  const topArticles = await Article.find({ status: 'published' })
    .sort({ viewCount: -1 })
    .limit(5)
    .select('title slug viewCount likes shares')
    .populate('author', 'name')
    .populate('category', 'name');

  // Get recent articles
  const recentArticles = await Article.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(5)
    .select('title slug publishedAt viewCount')
    .populate('author', 'name');

  // Get traffic by source
  const trafficSources = await Analytics.aggregate([
    {
      $match: {
        type: 'site',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        direct: { $sum: '$sources.direct' },
        social: { $sum: '$sources.social' },
        search: { $sum: '$sources.search' },
        referral: { $sum: '$sources.referral' }
      }
    }
  ]);

  // Get traffic by device
  const deviceStats = await Analytics.aggregate([
    {
      $match: {
        type: 'site',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        mobile: { $sum: '$devices.mobile' },
        desktop: { $sum: '$devices.desktop' },
        tablet: { $sum: '$devices.tablet' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalViews: siteAnalytics[0]?.totalViews || 0,
        uniqueViews: siteAnalytics[0]?.totalUniqueViews || 0,
        totalLikes: siteAnalytics[0]?.totalLikes || 0,
        totalShares: siteAnalytics[0]?.totalShares || 0,
        totalComments: siteAnalytics[0]?.totalComments || 0,
        avgReadTime: Math.round(siteAnalytics[0]?.avgReadTime || 0),
        bounceRate: Math.round(siteAnalytics[0]?.avgBounceRate || 0)
      },
      content: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalCategories,
        totalAuthors
      },
      topArticles,
      recentArticles,
      traffic: {
        sources: trafficSources[0] || { direct: 0, social: 0, search: 0, referral: 0 },
        devices: deviceStats[0] || { mobile: 0, desktop: 0, tablet: 0 }
      },
      period
    }
  });
});

// Get article analytics
export const getArticleAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { period = '30d' } = req.query;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(period as string));

  const analytics = await Analytics.find({
    type: 'article',
    referenceId: new mongoose.Types.ObjectId(id),
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  const article = await Article.findById(id)
    .select('title slug viewCount likes shares comments')
    .populate('author', 'name')
    .populate('category', 'name');

  if (!article) {
    return res.status(404).json({
      success: false,
      message: 'Article not found'
    });
  }

  // Calculate totals
  const totals = analytics.reduce((acc, day) => ({
    views: acc.views + day.metrics.views,
    uniqueViews: acc.uniqueViews + day.metrics.uniqueViews,
    likes: acc.likes + day.metrics.likes,
    shares: acc.shares + day.metrics.shares,
    comments: acc.comments + day.metrics.comments
  }), { views: 0, uniqueViews: 0, likes: 0, shares: 0, comments: 0 });

  res.json({
    success: true,
    data: {
      article,
      totals,
      timeline: analytics
    }
  });
});

// Get category analytics
export const getCategoryAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Get article count and stats
  const articles = await Article.find({ category: id, status: 'published' });
  const totalViews = articles.reduce((sum: number, article: any) => sum + (article.viewCount || 0), 0);
  const totalLikes = articles.reduce((sum: number, article: any) => sum + (article.likes || 0), 0);
  const totalShares = articles.reduce((sum: number, article: any) => sum + (article.shares || 0), 0);

  // Get top articles in category
  const topArticles = await Article.find({ category: id, status: 'published' })
    .sort({ viewCount: -1 })
    .limit(5)
    .select('title slug viewCount likes shares')
    .populate('author', 'name');

  res.json({
    success: true,
    data: {
      category,
      stats: {
        totalArticles: articles.length,
        totalViews,
        totalLikes,
        totalShares,
        avgViewsPerArticle: articles.length > 0 ? Math.round(totalViews / articles.length) : 0
      },
      topArticles
    }
  });
});

// Get author analytics
export const getAuthorAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const author = await Author.findById(id);
  if (!author) {
    return res.status(404).json({
      success: false,
      message: 'Author not found'
    });
  }

  // Get article stats
  const articles = await Article.find({ author: id, status: 'published' });
  const totalViews = articles.reduce((sum: number, article: any) => sum + (article.viewCount || 0), 0);
  const totalLikes = articles.reduce((sum: number, article: any) => sum + (article.likes || 0), 0);
  const totalShares = articles.reduce((sum: number, article: any) => sum + (article.shares || 0), 0);

  // Get top articles by author
  const topArticles = await Article.find({ author: id, status: 'published' })
    .sort({ viewCount: -1 })
    .limit(5)
    .select('title slug viewCount likes shares publishedAt')
    .populate('category', 'name');

  res.json({
    success: true,
    data: {
      author,
      stats: {
        totalArticles: articles.length,
        publishedArticles: articles.length,
        totalViews,
        totalLikes,
        totalShares,
        avgViewsPerArticle: articles.length > 0 ? Math.round(totalViews / articles.length) : 0
      },
      topArticles
    }
  });
});

// Track page view
export const trackPageView = asyncHandler(async (req: Request, res: Response) => {
  const { articleId, source = 'direct', device = 'desktop', location } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update or create analytics for today
  const update: any = {
    $inc: {
      'metrics.views': 1,
      'metrics.uniqueViews': 1
    }
  };

  // Increment source
  if (source) {
    update.$inc[`sources.${source}`] = 1;
  }

  // Increment device
  if (device) {
    update.$inc[`devices.${device}`] = 1;
  }

  // Update location
  if (location) {
    update.$inc = {
      ...update.$inc,
      [`locations.${location}`]: 1
    };
  }

  if (articleId) {
    // Track article view
    await Analytics.findOneAndUpdate(
      {
        type: 'article',
        referenceId: new mongoose.Types.ObjectId(articleId),
        date: today
      },
      update,
      { upsert: true, new: true }
    );

    // Update article view count
    await Article.findByIdAndUpdate(articleId, {
      $inc: { viewCount: 1 }
    });
  }

  // Track site-wide view
  await Analytics.findOneAndUpdate(
    {
      type: 'site',
      date: today
    },
    update,
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: 'View tracked'
  });
});

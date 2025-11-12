import { Request, Response } from 'express';
import Article, { IArticle } from '../models/Article';
import Author from '../models/Author';
import { Category } from '../models/Category';
import { slugify } from '../utils/slugify';
import { getDominicanTime, toDominicanTime } from '../utils/timezone';
import { addToRecycleBin } from './recycleBinController';
import mongoose from 'mongoose';

// Create article with rich text content
export const createArticle = async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug: providedSlug,
      content,
      excerpt,
      featuredImage,
      featuredImageAlt,
      gallery,
      embeds,
      categoryId,
      categoryIds, // Multiple categories
      authorId,
      tags,
      status,
      scheduledAt,
      seoTitle,
      seoDescription,
      isBreaking,
      isFeatured,
      isPinned,
      location,
      language
    } = req.body;

    // Use provided slug or generate from title
    let slug = providedSlug || slugify(title);
    
    // Ensure slug is unique
    let counter = 1;
    const baseSlug = slug;
    while (await Article.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Verify author and category exist
    const [authorExists, categoryExists] = await Promise.all([
      Author.findById(authorId),
      Category.findById(categoryId)
    ]);

    if (!authorExists) {
      return res.status(400).json({
        success: false,
        message: 'Author not found'
      });
    }

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    const articleData: Partial<IArticle> = {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      featuredImageAlt,
      gallery: gallery || [],
      embeds: embeds || [],
      author: authorId,
      category: categoryId, // Primary category
      categories: categoryIds || [categoryId], // Multiple categories (include primary)
      tags: tags || [],
      status: status || 'draft',
      seo: {
        metaTitle: seoTitle,
        metaDescription: seoDescription,
      },
      isBreaking: isBreaking || false,
      isFeatured: isFeatured || false,
      isPinned: isPinned || false,
      location,
      language: language || 'en'
    };

    // Handle scheduling
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      articleData.scheduledFor = toDominicanTime(scheduledDate);
      // If scheduled for future, set status to scheduled
      if (scheduledDate > new Date()) {
        articleData.status = 'scheduled';
      }
    }

    // Set published date if publishing immediately
    if (status === 'published') {
      articleData.publishedAt = getDominicanTime();
    }

    const article = new Article(articleData);
    await article.save();

    // Update author's article count
    await Author.findByIdAndUpdate(authorId, { $inc: { articlesCount: 1 } });

    // Populate author and categories for response
    await article.populate(['author', 'category', 'categories']);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating article',
      error: error.message
    });
  }
};

// Get all articles with filtering and pagination
export const getArticles = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      author,
      isBreaking,
      isFeatured,
      isPinned,
      search,
      language,
      location
    } = req.query;

    const query: any = {};

    // Build filter query
    if (status) query.status = status;
    if (category) query.category = category;
    if (author) query.author = author;
    if (isBreaking !== undefined) query.isBreaking = isBreaking === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (language) query.language = language;
    if (location) query.location = new RegExp(location as string, 'i');

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', '_id name email avatar specialization')
        .populate('category', '_id name slug color')
        .populate('categories', '_id name slug color')
        .sort({ isPinned: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: articles,
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
      message: 'Error fetching articles',
      error: error.message
    });
  }
};

// Get single article by ID (for editing)
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate('author', '_id name email avatar bio specialization socialMedia')
      .populate('category', '_id name slug color description')
      .populate('categories', '_id name slug color description');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
};

// Get single article by slug
export const getArticleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug })
      .populate('author', '_id name email avatar bio specialization socialMedia')
      .populate('category', '_id name slug color description')
      .populate('categories', '_id name slug color description');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: article
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
};

// Update article
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug: providedSlug,
      content,
      excerpt,
      featuredImage,
      featuredImageAlt,
      gallery,
      embeds,
      categoryId,
      categoryIds, // Multiple categories
      authorId,
      status,
      scheduledAt,
      isPinned,
      isFeatured,
      isBreaking,
      seoTitle,
      seoDescription,
      tags,
      location,
      language
    } = req.body;

    const updateData: any = {};

    // Update basic fields
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (featuredImageAlt !== undefined) updateData.featuredImageAlt = featuredImageAlt;
    if (gallery !== undefined) updateData.gallery = gallery;
    if (embeds !== undefined) updateData.embeds = embeds;
    if (categoryId !== undefined) {
      updateData.category = categoryId;
      // If primary category changes, ensure it's in categories array
      if (categoryIds === undefined) {
        updateData.categories = [categoryId];
      }
    }
    if (categoryIds !== undefined) updateData.categories = categoryIds;
    if (authorId !== undefined) updateData.author = authorId;
    if (status !== undefined) updateData.status = status;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isBreaking !== undefined) updateData.isBreaking = isBreaking;
    if (tags !== undefined) updateData.tags = tags;
    if (location !== undefined) updateData.location = location;
    if (language !== undefined) updateData.language = language;

    // Handle SEO fields - only update if provided
    if (seoTitle || seoDescription) {
      updateData.seo = {};
      if (seoTitle) updateData.seo.metaTitle = seoTitle;
      if (seoDescription) updateData.seo.metaDescription = seoDescription;
    }

    // Handle slug - use provided slug or generate from title
    if (providedSlug) {
      // Ensure provided slug is unique
      let slug = providedSlug;
      let counter = 1;
      const baseSlug = slug;
      while (await Article.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    } else if (title) {
      // Generate slug from title if no slug provided
      let newSlug = slugify(title);
      let counter = 1;
      
      // Make slug unique by checking against other articles (excluding current one)
      while (await Article.findOne({ slug: newSlug, _id: { $ne: id } })) {
        newSlug = `${slugify(title)}-${counter}`;
        counter++;
      }
      
      updateData.slug = newSlug;
    }

    // Handle status change to published
    if (status === 'published') {
      const article = await Article.findById(id);
      if (article && !article.publishedAt) {
        updateData.publishedAt = getDominicanTime();
      }
    }

    // Handle scheduling
    if (scheduledAt !== undefined) {
      if (scheduledAt) {
        const scheduledDate = new Date(scheduledAt);
        updateData.scheduledFor = toDominicanTime(scheduledDate);
        // If scheduled for future and not explicitly setting status, set to scheduled
        if (scheduledDate > new Date() && status === undefined) {
          updateData.status = 'scheduled';
        }
      } else {
        // Clear scheduling
        updateData.scheduledFor = null;
      }
    }

    const article = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate(['author', 'category', 'categories']);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating article',
      error: error.message
    });
  }
};

// Delete article (move to recycle bin)
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get user ID from request
    const userId = (req as any).user?.id || (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Move to recycle bin instead of permanent deletion
    await addToRecycleBin(
      'article',
      article._id,
      article.title,
      article.toObject(),
      req.user!.id
    );

    // Delete from main collection
    await Article.findByIdAndDelete(id);

    // Update author's article count
    await Author.findByIdAndUpdate(article.author, { $inc: { articlesCount: -1 } });

    res.json({
      success: true,
      message: 'Article moved to recycle bin'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: error.message
    });
  }
};

// Get breaking news
export const getBreakingNews = async (req: Request, res: Response) => {
  try {
    const breakingNews = await Article.find({
      status: 'published',
      isBreaking: true
    })
      .populate('author', '_id name')
      .populate('category', '_id name color')
      .populate('categories', '_id name color')
      .sort({ publishedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: breakingNews
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching breaking news',
      error: error.message
    });
  }
};

// Get featured articles
export const getFeaturedArticles = async (req: Request, res: Response) => {
  try {
    const featured = await Article.find({
      status: 'published',
      isFeatured: true
    })
      .populate('author', '_id name avatar')
      .populate('category', '_id name color')
      .populate('categories', '_id name color')
      .sort({ publishedAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: featured
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured articles',
      error: error.message
    });
  }
};

// Get articles by category slug
export const getCategoryArticles = async (req: Request, res: Response) => {
  try {
    const { categorySlug } = req.params;
    const {
      page = 1,
      limit = 12,
      status = 'published'
    } = req.query;

    // Find the category by slug
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get articles for this category (check both primary category and categories array)
    const [articles, totalArticles] = await Promise.all([
      Article.find({ 
        $or: [
          { category: category._id },
          { categories: category._id }
        ],
        status: status
      })
        .populate('author', '_id name email avatar specialization')
        .populate('category', '_id name slug color description')
        .populate('categories', '_id name slug color description')
        .sort({ isPinned: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Article.countDocuments({ 
        $or: [
          { category: category._id },
          { categories: category._id }
        ],
        status: status
      })
    ]);

    const totalPages = Math.ceil(totalArticles / limitNum);

    res.json({
      success: true,
      data: {
        category,
        articles,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalArticles,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category articles',
      error: error.message
    });
  }
};
// Get pinned articles
export const getPinnedArticles = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit as string);

    const articles = await Article.find({
      status: 'published',
      isPinned: true
    })
      .populate('author', '_id name email avatar specialization')
      .populate('category', '_id name slug color description')
      .populate('categories', '_id name slug color description')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limitNum);

    res.json({
      success: true,
      data: {
        articles,
        count: articles.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pinned articles',
      error: error.message
    });
  }
};

// Get related articles
export const getRelatedArticles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit as string);

    // Get the current article
    const currentArticle = await Article.findById(id);
    if (!currentArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Find related articles based on:
    // 1. Same categories
    // 2. Same tags
    // 3. Same author
    // Exclude current article
    const relatedArticles = await Article.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { category: currentArticle.category },
        { categories: { $in: currentArticle.categories || [] } },
        { tags: { $in: currentArticle.tags || [] } },
        { author: currentArticle.author }
      ]
    })
      .populate('author', '_id name avatar')
      .populate('category', '_id name slug color')
      .populate('categories', '_id name slug color')
      .sort({ publishedAt: -1 })
      .limit(limitNum);

    res.json({
      success: true,
      data: relatedArticles
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching related articles',
      error: error.message
    });
  }
};
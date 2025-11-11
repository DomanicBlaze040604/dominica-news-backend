import express, { Request, Response } from 'express';
import { EmbedService } from '../services/embedService';

const router = express.Router();

/**
 * POST /api/embeds/fetch
 * Fetch embed HTML for a given URL
 */
router.post('/fetch', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required',
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format',
      });
    }

    // Detect platform
    const platform = EmbedService.detectPlatform(url);
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform. Supported: Twitter, Instagram, YouTube, Facebook, TikTok',
      });
    }

    // Fetch embed HTML
    try {
      const embedResult = await EmbedService.getEmbed(url);
      
      return res.json({
        success: true,
        data: {
          html: embedResult.html,
          provider: embedResult.provider,
          url: embedResult.url,
        },
      });
    } catch (embedError: any) {
      // If oEmbed fails, return fallback
      console.error('Embed fetch error:', embedError.message);
      
      const fallbackHtml = EmbedService.generateFallbackEmbed(url, platform);
      
      return res.json({
        success: true,
        data: {
          html: fallbackHtml,
          provider: platform,
          url,
          fallback: true,
        },
        warning: embedError.message,
      });
    }
  } catch (error: any) {
    console.error('Embed route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch embed',
      error: error.message,
    });
  }
});

/**
 * GET /api/embeds/supported
 * Get list of supported platforms
 */
router.get('/supported', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      platforms: [
        {
          name: 'Twitter',
          domains: ['twitter.com', 'x.com'],
          requiresAuth: false,
        },
        {
          name: 'Instagram',
          domains: ['instagram.com'],
          requiresAuth: true,
          note: 'Requires FACEBOOK_APP_ID and FACEBOOK_APP_SECRET',
        },
        {
          name: 'YouTube',
          domains: ['youtube.com', 'youtu.be'],
          requiresAuth: false,
        },
        {
          name: 'Facebook',
          domains: ['facebook.com'],
          requiresAuth: true,
          note: 'Requires FACEBOOK_APP_ID and FACEBOOK_APP_SECRET',
        },
        {
          name: 'TikTok',
          domains: ['tiktok.com'],
          requiresAuth: false,
        },
      ],
    },
  });
});

export { router as embedRoutes };

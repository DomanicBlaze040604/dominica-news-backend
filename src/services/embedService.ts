import axios from 'axios';

interface EmbedResult {
  html: string;
  provider: string;
  url: string;
}

export class EmbedService {
  // Instagram and Facebook require App ID and Secret
  private static FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
  private static FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

  /**
   * Detect platform from URL
   */
  static detectPlatform(url: string): string | null {
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('tiktok.com')) return 'tiktok';
    return null;
  }

  /**
   * Fetch embed HTML from Twitter oEmbed API
   */
  static async getTwitterEmbed(url: string): Promise<EmbedResult> {
    try {
      const response = await axios.get('https://publish.twitter.com/oembed', {
        params: {
          url,
          omit_script: false,
          dnt: true,
        },
        timeout: 10000,
      });

      return {
        html: response.data.html,
        provider: 'twitter',
        url,
      };
    } catch (error: any) {
      console.error('Twitter embed error:', error.message);
      throw new Error('Failed to fetch Twitter embed');
    }
  }

  /**
   * Fetch embed HTML from Instagram oEmbed API
   */
  static async getInstagramEmbed(url: string): Promise<EmbedResult> {
    try {
      const accessToken = `${this.FACEBOOK_APP_ID}|${this.FACEBOOK_APP_SECRET}`;
      
      if (!this.FACEBOOK_APP_ID || !this.FACEBOOK_APP_SECRET) {
        throw new Error('Instagram embeds require FACEBOOK_APP_ID and FACEBOOK_APP_SECRET');
      }

      const response = await axios.get('https://graph.facebook.com/v17.0/instagram_oembed', {
        params: {
          url,
          access_token: accessToken,
          omitscript: false,
        },
        timeout: 10000,
      });

      return {
        html: response.data.html,
        provider: 'instagram',
        url,
      };
    } catch (error: any) {
      console.error('Instagram embed error:', error.message);
      throw new Error('Failed to fetch Instagram embed. Make sure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are set.');
    }
  }

  /**
   * Fetch embed HTML from YouTube oEmbed API
   */
  static async getYouTubeEmbed(url: string): Promise<EmbedResult> {
    try {
      const response = await axios.get('https://www.youtube.com/oembed', {
        params: {
          url,
          format: 'json',
        },
        timeout: 10000,
      });

      return {
        html: response.data.html,
        provider: 'youtube',
        url,
      };
    } catch (error: any) {
      console.error('YouTube embed error:', error.message);
      throw new Error('Failed to fetch YouTube embed');
    }
  }

  /**
   * Fetch embed HTML from Facebook oEmbed API
   */
  static async getFacebookEmbed(url: string): Promise<EmbedResult> {
    try {
      const accessToken = `${this.FACEBOOK_APP_ID}|${this.FACEBOOK_APP_SECRET}`;
      
      if (!this.FACEBOOK_APP_ID || !this.FACEBOOK_APP_SECRET) {
        throw new Error('Facebook embeds require FACEBOOK_APP_ID and FACEBOOK_APP_SECRET');
      }

      const response = await axios.get('https://graph.facebook.com/v17.0/oembed_post', {
        params: {
          url,
          access_token: accessToken,
          omitscript: false,
        },
        timeout: 10000,
      });

      return {
        html: response.data.html,
        provider: 'facebook',
        url,
      };
    } catch (error: any) {
      console.error('Facebook embed error:', error.message);
      throw new Error('Failed to fetch Facebook embed. Make sure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are set.');
    }
  }

  /**
   * Fetch embed HTML from TikTok oEmbed API
   */
  static async getTikTokEmbed(url: string): Promise<EmbedResult> {
    try {
      const response = await axios.get('https://www.tiktok.com/oembed', {
        params: {
          url,
        },
        timeout: 10000,
      });

      return {
        html: response.data.html,
        provider: 'tiktok',
        url,
      };
    } catch (error: any) {
      console.error('TikTok embed error:', error.message);
      throw new Error('Failed to fetch TikTok embed');
    }
  }

  /**
   * Main method to fetch embed HTML for any supported platform
   */
  static async getEmbed(url: string): Promise<EmbedResult> {
    const platform = this.detectPlatform(url);

    if (!platform) {
      throw new Error('Unsupported platform. Supported: Twitter, Instagram, YouTube, Facebook, TikTok');
    }

    switch (platform) {
      case 'twitter':
        return this.getTwitterEmbed(url);
      case 'instagram':
        return this.getInstagramEmbed(url);
      case 'youtube':
        return this.getYouTubeEmbed(url);
      case 'facebook':
        return this.getFacebookEmbed(url);
      case 'tiktok':
        return this.getTikTokEmbed(url);
      default:
        throw new Error('Unsupported platform');
    }
  }

  /**
   * Generate fallback embed HTML if oEmbed fails
   */
  static generateFallbackEmbed(url: string, platform: string): string {
    return `
      <div class="embed-fallback" style="padding: 20px; border: 1px solid #ddd; border-radius: 8px; text-align: center; background: #f9f9f9;">
        <p style="margin: 0 0 10px 0; font-weight: 600;">View this ${platform} post</p>
        <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1da1f2; text-decoration: none;">
          Open in ${platform.charAt(0).toUpperCase() + platform.slice(1)}
        </a>
      </div>
    `;
  }
}

export default EmbedService;

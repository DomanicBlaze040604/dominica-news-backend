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
   * Falls back to twitframe if API fails
   */
  static async getTwitterEmbed(url: string): Promise<EmbedResult> {
    try {
      // Try official oEmbed API first
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
      console.error('Twitter embed error, using fallback:', error.message);
      
      // Fallback: Use twitframe (no API key needed)
      const encodedUrl = encodeURIComponent(url);
      const iframeHtml = `
        <iframe 
          src="https://twitframe.com/show?url=${encodedUrl}" 
          width="500" 
          height="600" 
          style="border:none;overflow:hidden;max-width:100%;" 
          frameborder="0"
          allowfullscreen
        ></iframe>
      `;

      return {
        html: iframeHtml,
        provider: 'twitter',
        url,
      };
    }
  }

  /**
   * Fetch embed HTML from Instagram oEmbed API
   * Falls back to iframe embed if API fails
   */
  static async getInstagramEmbed(url: string): Promise<EmbedResult> {
    try {
      // Try official oEmbed API first (requires Facebook App)
      if (this.FACEBOOK_APP_ID && this.FACEBOOK_APP_SECRET) {
        const accessToken = `${this.FACEBOOK_APP_ID}|${this.FACEBOOK_APP_SECRET}`;
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
      }
      
      // Fallback: Use iframe embed (no API key needed)
      const postId = url.split('/p/')[1]?.split('/')[0];
      if (!postId) {
        throw new Error('Invalid Instagram URL');
      }
      
      const iframeHtml = `
        <iframe 
          src="https://www.instagram.com/p/${postId}/embed" 
          width="500" 
          height="680" 
          frameborder="0" 
          scrolling="no" 
          allowtransparency="true"
          allow="encrypted-media"
          style="border:none;overflow:hidden;max-width:100%;"
        ></iframe>
      `;

      return {
        html: iframeHtml,
        provider: 'instagram',
        url,
      };
    } catch (error: any) {
      console.error('Instagram embed error:', error.message);
      throw new Error('Failed to fetch Instagram embed');
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
   * Falls back to iframe embed if API fails
   */
  static async getFacebookEmbed(url: string): Promise<EmbedResult> {
    try {
      // Try official oEmbed API first (requires Facebook App)
      if (this.FACEBOOK_APP_ID && this.FACEBOOK_APP_SECRET) {
        const accessToken = `${this.FACEBOOK_APP_ID}|${this.FACEBOOK_APP_SECRET}`;
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
      }
      
      // Fallback: Use Facebook's plugin iframe (no API key needed)
      const encodedUrl = encodeURIComponent(url);
      const iframeHtml = `
        <iframe 
          src="https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500" 
          width="500" 
          height="680" 
          style="border:none;overflow:hidden;max-width:100%;" 
          scrolling="no" 
          frameborder="0" 
          allowfullscreen="true" 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        ></iframe>
      `;

      return {
        html: iframeHtml,
        provider: 'facebook',
        url,
      };
    } catch (error: any) {
      console.error('Facebook embed error:', error.message);
      throw new Error('Failed to fetch Facebook embed');
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

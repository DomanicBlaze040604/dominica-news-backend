import Article from '../models/Article';
import { getDominicanTime } from '../utils/timezone';

/**
 * Service to automatically publish scheduled articles
 * This should be run periodically (e.g., every minute via cron job)
 */
export const publishScheduledArticles = async () => {
  try {
    const now = getDominicanTime();
    
    // Debug logging
    console.log(`🔍 Checking for scheduled articles at ${now.toISOString()}`);
    
    // Find all scheduled articles that should be published
    const articlesToPublish = await Article.find({
      status: 'scheduled',
      scheduledFor: { $lte: now }
    });

    // Debug: Show all scheduled articles
    const allScheduled = await Article.find({ status: 'scheduled' });
    if (allScheduled.length > 0) {
      console.log(`📋 Found ${allScheduled.length} scheduled articles:`);
      allScheduled.forEach(a => {
        console.log(`   - "${a.title}" scheduled for ${a.scheduledFor?.toISOString()}`);
      });
    }

    if (articlesToPublish.length === 0) {
      return {
        success: true,
        message: 'No articles to publish',
        count: 0
      };
    }

    // Update all articles to published status
    const updatePromises = articlesToPublish.map(article => 
      Article.findByIdAndUpdate(article._id, {
        status: 'published',
        publishedAt: now
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Published ${articlesToPublish.length} scheduled articles`);

    return {
      success: true,
      message: `Published ${articlesToPublish.length} articles`,
      count: articlesToPublish.length,
      articles: articlesToPublish.map(a => ({ id: a._id, title: a.title }))
    };
  } catch (error: any) {
    console.error('❌ Error publishing scheduled articles:', error);
    return {
      success: false,
      message: 'Error publishing scheduled articles',
      error: error.message
    };
  }
};

/**
 * Start the scheduled publisher cron job
 * Runs every minute to check for articles to publish
 */
export const startScheduledPublisher = () => {
  // Run immediately on startup
  publishScheduledArticles();

  // Then run every minute
  setInterval(() => {
    publishScheduledArticles();
  }, 60000); // 60000ms = 1 minute

  console.log('📅 Scheduled article publisher started');
};

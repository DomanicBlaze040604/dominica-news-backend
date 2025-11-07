import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  date: Date;
  type: 'article' | 'category' | 'author' | 'site';
  referenceId?: mongoose.Types.ObjectId;
  metrics: {
    views: number;
    uniqueViews: number;
    likes: number;
    shares: number;
    comments: number;
    avgReadTime?: number;
    bounceRate?: number;
  };
  sources: {
    direct: number;
    social: number;
    search: number;
    referral: number;
  };
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  locations: Map<string, number>;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: Date,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['article', 'category', 'author', 'site'],
      index: true
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      index: true
    },
    metrics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      avgReadTime: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 }
    },
    sources: {
      direct: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      referral: { type: Number, default: 0 }
    },
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    },
    locations: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
analyticsSchema.index({ type: 1, date: -1 });
analyticsSchema.index({ referenceId: 1, date: -1 });
analyticsSchema.index({ type: 1, referenceId: 1, date: -1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);

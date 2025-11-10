import mongoose, { Document, Schema } from 'mongoose';
import { toDominicanTime } from '../utils/timezone';

export interface ILiveUpdate extends Document {
  title: string;
  content: string;
  type: 'breaking' | 'sports' | 'weather' | 'traffic' | 'election' | 'general';
  status: 'active' | 'paused' | 'ended';
  priority: number; // 1-5, 5 being highest
  category?: mongoose.Types.ObjectId;
  tags: string[];
  author: mongoose.Types.ObjectId;
  updates: Array<{
    timestamp: Date;
    content: string;
    author: mongoose.Types.ObjectId;
    attachments?: string[];
  }>;
  metadata?: {
    score?: string; // For sports: "Team A 2 - 1 Team B"
    location?: string;
    temperature?: string; // For weather
    participants?: string[]; // For elections, sports teams, etc.
  };
  startedAt: Date;
  endedAt?: Date;
  autoRefresh: boolean; // Auto-refresh on frontend
  refreshInterval: number; // Seconds
  isSticky: boolean; // Pin to top
  showOnHomepage: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LiveUpdateSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Live update title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['breaking', 'sports', 'weather', 'traffic', 'election', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'ended'],
    default: 'active'
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required']
  },
  updates: [{
    timestamp: {
      type: Date,
      default: () => toDominicanTime(new Date())
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Author',
      required: true
    },
    attachments: [{
      type: String
    }]
  }],
  metadata: {
    score: String,
    location: String,
    temperature: String,
    participants: [String]
  },
  startedAt: {
    type: Date,
    default: () => toDominicanTime(new Date())
  },
  endedAt: {
    type: Date,
    default: null
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 30, // 30 seconds
    min: 10,
    max: 300
  },
  isSticky: {
    type: Boolean,
    default: false
  },
  showOnHomepage: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
LiveUpdateSchema.index({ status: 1, priority: -1, startedAt: -1 });
LiveUpdateSchema.index({ type: 1, status: 1 });
LiveUpdateSchema.index({ isSticky: 1, showOnHomepage: 1 });
LiveUpdateSchema.index({ category: 1 });

// Virtual for duration
LiveUpdateSchema.virtual('duration').get(function(this: ILiveUpdate) {
  if (this.endedAt) {
    return this.endedAt.getTime() - this.startedAt.getTime();
  }
  return Date.now() - this.startedAt.getTime();
});

// Virtual for update count
LiveUpdateSchema.virtual('updateCount').get(function(this: ILiveUpdate) {
  return this.updates?.length || 0;
});

export default mongoose.model<ILiveUpdate>('LiveUpdate', LiveUpdateSchema);

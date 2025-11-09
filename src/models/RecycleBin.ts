import mongoose, { Document, Schema } from 'mongoose';

export interface IRecycleBinItem extends Document {
  itemType: 'article' | 'category' | 'tag' | 'page' | 'breaking-news';
  itemId: mongoose.Types.ObjectId;
  title: string;
  originalData: any;
  deletedBy: mongoose.Types.ObjectId;
  deletedAt: Date;
  expiresAt: Date;
}

const RecycleBinSchema = new Schema<IRecycleBinItem>({
  itemType: {
    type: String,
    required: true,
    enum: ['article', 'category', 'tag', 'page', 'breaking-news']
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  originalData: {
    type: Schema.Types.Mixed,
    required: true
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expires: 0 } // TTL index - auto-delete after expiration
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes
RecycleBinSchema.index({ itemType: 1, deletedAt: -1 });
RecycleBinSchema.index({ deletedBy: 1 });
RecycleBinSchema.index({ expiresAt: 1 });

export const RecycleBin = mongoose.model<IRecycleBinItem>('RecycleBin', RecycleBinSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IRecycleBin extends Document {
  itemType: 'article' | 'category' | 'author' | 'staticPage';
  itemId: string;
  itemData: any;
  deletedBy: mongoose.Types.ObjectId;
  deletedAt: Date;
  expiresAt: Date;
  originalCollection: string;
  canRestore: boolean;
  metadata: {
    title?: string;
    name?: string;
    slug?: string;
    status?: string;
  };
}

const recycleBinSchema = new Schema<IRecycleBin>(
  {
    itemType: {
      type: String,
      required: true,
      enum: ['article', 'category', 'author', 'staticPage'],
      index: true
    },
    itemId: {
      type: String,
      required: true
    },
    itemData: {
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
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    originalCollection: {
      type: String,
      required: true
    },
    canRestore: {
      type: Boolean,
      default: true
    },
    metadata: {
      title: String,
      name: String,
      slug: String,
      status: String
    }
  },
  {
    timestamps: true
  }
);

// Index for automatic cleanup
recycleBinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for queries
recycleBinSchema.index({ itemType: 1, deletedAt: -1 });
recycleBinSchema.index({ deletedBy: 1, deletedAt: -1 });

export const RecycleBin = mongoose.model<IRecycleBin>('RecycleBin', recycleBinSchema);

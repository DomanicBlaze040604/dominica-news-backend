import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  name: string;
  originalName: string;
  url: string;
  type: string;
  mimeType?: string;
  size: number; // in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  alt?: string;
  description?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  uploadedAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  name: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    default: 'image',
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
    required: true,
  },
  dimensions: {
    width: Number,
    height: Number,
  },
  alt: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster queries
MediaSchema.index({ uploadedAt: -1 });
MediaSchema.index({ type: 1 });
MediaSchema.index({ name: 'text', alt: 'text', description: 'text' });

const Media = mongoose.model<IMedia>('Media', MediaSchema);

export default Media;

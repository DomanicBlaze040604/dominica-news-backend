import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  avatar?: string;
  title?: string;
  professionalBackground?: string;
  expertise?: string[];
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  specialization?: string[];
  isActive: boolean;
  joinDate: Date;
  articlesCount: number;
  location?: string;
  phone?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true, // Allow null/undefined during creation
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty
        // More flexible email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  professionalBackground: {
    type: String,
    maxlength: [2000, 'Professional background cannot exceed 2000 characters']
  },
  expertise: [{
    type: String,
    maxlength: [50, 'Expertise area cannot exceed 50 characters']
  }],
  socialMedia: {
    twitter: String,
    facebook: String,
    instagram: String,
    linkedin: String
  },
  specialization: [{
    type: String,
    maxlength: [50, 'Specialization cannot exceed 50 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  articlesCount: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  phone: {
    type: String,
    match: [/^[\+]?[\d]{1,20}$/, 'Please enter a valid phone number']
  },
  website: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty
        // Allow URLs with or without protocol
        return /^(https?:\/\/)?.+\..+/.test(v);
      },
      message: 'Please enter a valid website URL'
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function (doc, ret) {
      (ret as any).id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Index for search
AuthorSchema.index({ name: 'text', bio: 'text', professionalBackground: 'text' });
AuthorSchema.index({ email: 1 });
AuthorSchema.index({ slug: 1 });
AuthorSchema.index({ isActive: 1 });

// Virtual for full profile URL
AuthorSchema.virtual('profileUrl').get(function() {
  return `/authors/${this.slug}`;
});

// Auto-generate slug from name before saving
AuthorSchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    let baseSlug = generateSlug(this.name as string);
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs and ensure uniqueness
    while (true) {
      const existingAuthor = await (this.constructor as any).findOne({ 
        slug, 
        _id: { $ne: this._id } 
      });
      
      if (!existingAuthor) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

export default mongoose.model<IAuthor>('Author', AuthorSchema);
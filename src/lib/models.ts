import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Category ─────────────────────────────────────────────────────────────────
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  showInNav: boolean;
  showInFooter: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    showInNav: { type: Boolean, default: true },
    showInFooter: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Author ───────────────────────────────────────────────────────────────────
export interface IAuthor extends Document {
  name: string;
  slug: string;
  email?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: { twitter?: string; linkedin?: string; github?: string; website?: string };
  isActive: boolean;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: String,
    avatar: String,
    bio: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
      website: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Tag ──────────────────────────────────────────────────────────────────────
export interface ITag extends Document {
  name: string;
  slug: string;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

// ─── Article ──────────────────────────────────────────────────────────────────
export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  content: string;
  category?: Types.ObjectId;
  author?: Types.ObjectId;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords: string[];
  canonicalUrl?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: Date;
  publishedAt?: Date;
  viewCount: number;
  readingTime: number;
  revisions: mongoose.Types.DocumentArray<any>;
}

// Use mongoose.Schema.Types.Mixed correctly — NOT in an array wrapper
const ArticleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: String,
    featuredImage: String,
    content: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    seoKeywords: [String],
    canonicalUrl: String,
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
    scheduledAt: Date,
    publishedAt: Date,
    viewCount: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    // Use Mixed directly (not wrapped in []) to avoid TS type conflict
    revisions: { type: Schema.Types.Mixed, default: [], select: false },
  },
  { timestamps: true }
);

ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, status: 1 });
ArticleSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

// ─── Newsletter ───────────────────────────────────────────────────────────────
export interface ISubscriber extends Document {
  email: string;
  isActive: boolean;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Contact ──────────────────────────────────────────────────────────────────
export interface IContact extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  },
  { timestamps: true }
);

// ─── Setting ──────────────────────────────────────────────────────────────────
export interface ISetting extends Document {
  key: string;
  value: any;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: Schema.Types.Mixed,
  },
  { timestamps: true }
);


// ─── Advertisement ────────────────────────────────────────────────────────────
export interface IAd extends Document {
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: 'header' | 'sidebar' | 'in-article' | 'footer' | 'homepage-banner';
  isActive: boolean;
  opensInNewTab: boolean;
  order: number;
}

const AdSchema = new Schema<IAd>(
  {
    name:          { type: String, required: true, trim: true },
    imageUrl:      { type: String, required: true },
    linkUrl:       { type: String, required: true },
    placement:     { type: String, enum: ['header', 'sidebar', 'in-article', 'footer', 'homepage-banner'], default: 'sidebar' },
    isActive:      { type: Boolean, default: true },
    opensInNewTab: { type: Boolean, default: true },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Phone Category ─────────────────────────────────────────────────────────
export interface IPhoneCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

const PhoneCategorySchema = new Schema<IPhoneCategory>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    icon:        String, // lucide icon name, e.g. "Wallet", "Crown", "Camera", "Gamepad2"
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Phone ──────────────────────────────────────────────────────────────────
export interface IPhoneSpecs {
  display?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  charging?: string;
  rearCamera?: string;
  frontCamera?: string;
  os?: string;
  network?: string;
  dimensions?: string;
  weight?: string;
  colors?: string;
}

export interface IPhone extends Document {
  name: string;
  slug: string;
  brand: string;
  category: Types.ObjectId;
  price: number;
  currency: string;
  images: string[];
  description: string;
  specs: IPhoneSpecs;
  pros: string[];
  cons: string[];
  rating?: number;
  buyLink?: string;
  isActive: boolean;
  isFeatured: boolean;
}

const PhoneSchema = new Schema<IPhone>(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand:    { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'PhoneCategory', required: true },
    price:    { type: Number, required: true, default: 0 },
    currency: { type: String, default: '₹' },
    images:   { type: [String], default: [] },
    description: { type: String, default: '' },
    specs: {
      display:     String,
      processor:   String,
      ram:         String,
      storage:     String,
      battery:     String,
      charging:    String,
      rearCamera:  String,
      frontCamera: String,
      os:          String,
      network:     String,
      dimensions:  String,
      weight:      String,
      colors:      String,
    },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    rating:     { type: Number, min: 0, max: 5 },
    buyLink:    String,
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PhoneSchema.index({ category: 1, isActive: 1 });
PhoneSchema.index({ slug: 1 });

// ─── Monthly View Stats ─────────────────────────────────────────────────────
export interface IMonthlyStats extends Document {
  month: string; // 'YYYY-MM' format, e.g. '2026-06'
  views: number;
}

const MonthlyStatsSchema = new Schema<IMonthlyStats>(
  {
    month: { type: String, required: true, unique: true }, // 'YYYY-MM'
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Comment ────────────────────────────────────────────────────────────────
export interface IComment extends Document {
  article: Types.ObjectId;
  parent?: Types.ObjectId; // top-level comment if undefined; reply if set
  name: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
}

const CommentSchema = new Schema<IComment>(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    parent:  { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    name:    { type: String, required: true, trim: true, maxlength: 80 },
    email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    status:  { type: String, enum: ['pending', 'approved', 'spam'], default: 'approved' },
  },
  { timestamps: true }
);

CommentSchema.index({ article: 1, status: 1, createdAt: 1 });
CommentSchema.index({ parent: 1 });

// ─── Laptop Category ────────────────────────────────────────────────────────
export interface ILaptopCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

const LaptopCategorySchema = new Schema<ILaptopCategory>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    icon:        String,
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Laptop ─────────────────────────────────────────────────────────────────
export interface ILaptopSpecs {
  display?: string;
  processor?: string;
  graphics?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  ports?: string;
  os?: string;
  weight?: string;
  dimensions?: string;
  colors?: string;
}

export interface ILaptop extends Document {
  name: string;
  slug: string;
  brand: string;
  category: Types.ObjectId;
  price: number;
  currency: string;
  images: string[];
  description: string;
  specs: ILaptopSpecs;
  pros: string[];
  cons: string[];
  rating?: number;
  buyLink?: string;
  isActive: boolean;
  isFeatured: boolean;
}

const LaptopSchema = new Schema<ILaptop>(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand:    { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'LaptopCategory', required: true },
    price:    { type: Number, required: true, default: 0 },
    currency: { type: String, default: '₹' },
    images:   { type: [String], default: [] },
    description: { type: String, default: '' },
    specs: {
      display:    String,
      processor:  String,
      graphics:   String,
      ram:        String,
      storage:    String,
      battery:    String,
      ports:      String,
      os:         String,
      weight:     String,
      dimensions: String,
      colors:     String,
    },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    rating:     { type: Number, min: 0, max: 5 },
    buyLink:    String,
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LaptopSchema.index({ category: 1, isActive: 1 });
LaptopSchema.index({ slug: 1 });

// ─── Drawing Tablet Category ────────────────────────────────────────────────
export interface ITabletCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

const TabletCategorySchema = new Schema<ITabletCategory>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    icon:        String,
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Drawing Tablet ─────────────────────────────────────────────────────────
export interface ITabletSpecs {
  activeArea?: string;
  resolution?: string;
  pressureLevels?: string;
  penType?: string;
  connectivity?: string;
  compatibility?: string;
  expressKeys?: string;
  battery?: string;
  weight?: string;
  dimensions?: string;
}

export interface ITablet extends Document {
  name: string;
  slug: string;
  brand: string;
  category: Types.ObjectId;
  price: number;
  currency: string;
  images: string[];
  description: string;
  specs: ITabletSpecs;
  pros: string[];
  cons: string[];
  rating?: number;
  buyLink?: string;
  isActive: boolean;
  isFeatured: boolean;
}

const TabletSchema = new Schema<ITablet>(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand:    { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'TabletCategory', required: true },
    price:    { type: Number, required: true, default: 0 },
    currency: { type: String, default: '₹' },
    images:   { type: [String], default: [] },
    description: { type: String, default: '' },
    specs: {
      activeArea:     String,
      resolution:     String,
      pressureLevels: String,
      penType:        String,
      connectivity:   String,
      compatibility:  String,
      expressKeys:    String,
      battery:        String,
      weight:         String,
      dimensions:     String,
    },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    rating:     { type: Number, min: 0, max: 5 },
    buyLink:    String,
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TabletSchema.index({ category: 1, isActive: 1 });
TabletSchema.index({ slug: 1 });

// ─── Camera Category ────────────────────────────────────────────────────────
export interface ICameraCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

const CameraCategorySchema = new Schema<ICameraCategory>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    icon:        String,
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Camera ─────────────────────────────────────────────────────────────────
export interface ICameraSpecs {
  sensorType?: string;
  resolution?: string;
  lensMount?: string;
  iso?: string;
  videoResolution?: string;
  autofocus?: string;
  stabilization?: string;
  battery?: string;
  weight?: string;
  dimensions?: string;
}

export interface ICamera extends Document {
  name: string;
  slug: string;
  brand: string;
  category: Types.ObjectId;
  price: number;
  currency: string;
  images: string[];
  description: string;
  specs: ICameraSpecs;
  pros: string[];
  cons: string[];
  rating?: number;
  buyLink?: string;
  isActive: boolean;
  isFeatured: boolean;
}

const CameraSchema = new Schema<ICamera>(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand:    { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'CameraCategory', required: true },
    price:    { type: Number, required: true, default: 0 },
    currency: { type: String, default: '₹' },
    images:   { type: [String], default: [] },
    description: { type: String, default: '' },
    specs: {
      sensorType:      String,
      resolution:      String,
      lensMount:       String,
      iso:             String,
      videoResolution: String,
      autofocus:       String,
      stabilization:   String,
      battery:         String,
      weight:          String,
      dimensions:      String,
    },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    rating:     { type: Number, min: 0, max: 5 },
    buyLink:    String,
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CameraSchema.index({ category: 1, isActive: 1 });
CameraSchema.index({ slug: 1 });

// ─── Export models (safe for Next.js hot-reload) ──────────────────────────────
export const User = (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);
export const Category = (mongoose.models.Category as mongoose.Model<ICategory>) ||
  mongoose.model<ICategory>('Category', CategorySchema);
export const Author = (mongoose.models.Author as mongoose.Model<IAuthor>) ||
  mongoose.model<IAuthor>('Author', AuthorSchema);
export const Tag = (mongoose.models.Tag as mongoose.Model<ITag>) ||
  mongoose.model<ITag>('Tag', TagSchema);
export const Article = (mongoose.models.Article as mongoose.Model<any>) ||
  mongoose.model('Article', ArticleSchema);
export const Subscriber = (mongoose.models.Subscriber as mongoose.Model<ISubscriber>) ||
  mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
export const Contact = (mongoose.models.Contact as mongoose.Model<IContact>) ||
  mongoose.model<IContact>('Contact', ContactSchema);
export const Setting = (mongoose.models.Setting as mongoose.Model<ISetting>) ||
  mongoose.model<ISetting>('Setting', SettingSchema);
export const Ad = (mongoose.models.Ad as mongoose.Model<IAd>) ||
  mongoose.model<IAd>('Ad', AdSchema);
export const PhoneCategory = (mongoose.models.PhoneCategory as mongoose.Model<IPhoneCategory>) ||
  mongoose.model<IPhoneCategory>('PhoneCategory', PhoneCategorySchema);
export const Phone = (mongoose.models.Phone as mongoose.Model<IPhone>) ||
  mongoose.model<IPhone>('Phone', PhoneSchema);
export const LaptopCategory = (mongoose.models.LaptopCategory as mongoose.Model<ILaptopCategory>) ||
  mongoose.model<ILaptopCategory>('LaptopCategory', LaptopCategorySchema);
export const Laptop = (mongoose.models.Laptop as mongoose.Model<ILaptop>) ||
  mongoose.model<ILaptop>('Laptop', LaptopSchema);
export const TabletCategory = (mongoose.models.TabletCategory as mongoose.Model<ITabletCategory>) ||
  mongoose.model<ITabletCategory>('TabletCategory', TabletCategorySchema);
export const Tablet = (mongoose.models.Tablet as mongoose.Model<ITablet>) ||
  mongoose.model<ITablet>('Tablet', TabletSchema);
export const CameraCategory = (mongoose.models.CameraCategory as mongoose.Model<ICameraCategory>) ||
  mongoose.model<ICameraCategory>('CameraCategory', CameraCategorySchema);
export const Camera = (mongoose.models.Camera as mongoose.Model<ICamera>) ||
  mongoose.model<ICamera>('Camera', CameraSchema);
export const MonthlyStats = (mongoose.models.MonthlyStats as mongoose.Model<IMonthlyStats>) ||
  mongoose.model<IMonthlyStats>('MonthlyStats', MonthlyStatsSchema);
export const Comment = (mongoose.models.Comment as mongoose.Model<IComment>) ||
  mongoose.model<IComment>('Comment', CommentSchema);

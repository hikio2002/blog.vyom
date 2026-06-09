export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  showInNav: boolean;
  showInFooter: boolean;
  createdAt: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  email?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: { twitter?: string; linkedin?: string; github?: string; website?: string };
  isActive: boolean;
  createdAt: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  content: string;
  category: Category;
  author: Author;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string;
  publishedAt?: string;
  viewCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedArticles {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface SiteSettings {
  siteName?: string;
  siteTagline?: string;
  siteUrl?: string;
  siteEmail?: string;
  metaDescription?: string;
  googleAnalyticsId?: string;
  adsensePublisherId?: string;
  socialLinks?: { twitter?: string; facebook?: string; instagram?: string; youtube?: string };
}

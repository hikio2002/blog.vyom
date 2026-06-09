import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article, Category, Author } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest';
    const [articles, categories, authors] = await Promise.all([
      Article.find({ status: 'published' }).select('slug updatedAt publishedAt').sort({ publishedAt: -1 }).lean(),
      Category.find({ isActive: true }).select('slug').lean(),
      Author.find({ isActive: true }).select('slug').lean(),
    ]);

    const staticPages = [
      { path: '', priority: '1.0', freq: 'daily' },
      { path: '/about', priority: '0.6', freq: 'monthly' },
      { path: '/contact', priority: '0.5', freq: 'monthly' },
      { path: '/authors', priority: '0.6', freq: 'weekly' },
      { path: '/categories', priority: '0.7', freq: 'weekly' },
      { path: '/advertise', priority: '0.4', freq: 'monthly' },
      { path: '/privacy-policy', priority: '0.3', freq: 'monthly' },
      { path: '/terms', priority: '0.3', freq: 'monthly' },
    ];

    const urlTags = [
      ...staticPages.map(p => `
  <url>
    <loc>${site}${p.path}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
      ...(categories as any[]).map(c => `
  <url>
    <loc>${site}/category/${c.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`),
      ...(authors as any[]).map(a => `
  <url>
    <loc>${site}/author/${a.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`),
      ...(articles as any[]).map(a => `
  <url>
    <loc>${site}/blog/${a.slug}</loc>
    <lastmod>${new Date(a.updatedAt || a.publishedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urlTags.join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

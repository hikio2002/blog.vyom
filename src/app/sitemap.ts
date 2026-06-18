import { MetadataRoute } from 'next';
import { dbConnect } from '@/lib/db';
import { Article, Category, Author, Phone, PhoneCategory, Laptop, LaptopCategory, Tablet, TabletCategory, Camera, CameraCategory } from '@/lib/models';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest').replace(/\/$/, '');
  try {
    await dbConnect();
    const [articles, categories, authors, phones, phoneCategories, laptops, laptopCategories, tablets, tabletCategories, cameras, cameraCategories] = await Promise.all([
      Article.find({ status: 'published' }).select('slug updatedAt').sort({ updatedAt: -1 }).lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
      Author.find({ isActive: true }).select('slug updatedAt').lean(),
      Phone.find({ isActive: true }).select('slug updatedAt').lean(),
      PhoneCategory.find({ isActive: true }).select('slug updatedAt').lean(),
      Laptop.find({ isActive: true }).select('slug updatedAt').lean(),
      LaptopCategory.find({ isActive: true }).select('slug updatedAt').lean(),
      Tablet.find({ isActive: true }).select('slug updatedAt').lean(),
      TabletCategory.find({ isActive: true }).select('slug updatedAt').lean(),
      Camera.find({ isActive: true }).select('slug updatedAt').lean(),
      CameraCategory.find({ isActive: true }).select('slug updatedAt').lean(),
    ]);

    const staticUrls: MetadataRoute.Sitemap = [
      { url: site, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${site}/about`, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${site}/contact`, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${site}/authors`, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${site}/categories`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${site}/phones`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${site}/laptops`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${site}/tablets`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${site}/cameras`, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${site}/advertise`, changeFrequency: 'monthly', priority: 0.4 },
      { url: `${site}/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/terms`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/disclaimer`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/cookie-policy`, changeFrequency: 'monthly', priority: 0.3 },
      { url: `${site}/editorial-policy`, changeFrequency: 'monthly', priority: 0.3 },
    ];

    const categoryUrls: MetadataRoute.Sitemap = (categories as any[]).map(c => ({
      url: `${site}/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    const authorUrls: MetadataRoute.Sitemap = (authors as any[]).map(a => ({
      url: `${site}/author/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const articleUrls: MetadataRoute.Sitemap = (articles as any[]).map(a => ({
      url: `${site}/blog/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const phoneCategoryUrls: MetadataRoute.Sitemap = (phoneCategories as any[]).map(c => ({
      url: `${site}/phones/category/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const phoneUrls: MetadataRoute.Sitemap = (phones as any[]).map(p => ({
      url: `${site}/phones/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const makeDeviceUrls = (items: any[], basePath: string, priority: number): MetadataRoute.Sitemap =>
      items.map(d => ({
        url: `${site}/${basePath}/${d.slug}`,
        lastModified: d.updatedAt,
        changeFrequency: 'weekly' as const,
        priority,
      }));

    const laptopCategoryUrls = makeDeviceUrls(laptopCategories as any[], 'laptops/category', 0.6);
    const laptopUrls = makeDeviceUrls(laptops as any[], 'laptops', 0.7);
    const tabletCategoryUrls = makeDeviceUrls(tabletCategories as any[], 'tablets/category', 0.6);
    const tabletUrls = makeDeviceUrls(tablets as any[], 'tablets', 0.7);
    const cameraCategoryUrls = makeDeviceUrls(cameraCategories as any[], 'cameras/category', 0.6);
    const cameraUrls = makeDeviceUrls(cameras as any[], 'cameras', 0.7);

    return [
      ...staticUrls, ...categoryUrls, ...authorUrls, ...articleUrls,
      ...phoneCategoryUrls, ...phoneUrls,
      ...laptopCategoryUrls, ...laptopUrls,
      ...tabletCategoryUrls, ...tabletUrls,
      ...cameraCategoryUrls, ...cameraUrls,
    ];
  } catch {
    return [{ url: site, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
  }
}

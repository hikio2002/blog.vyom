import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest').replace(/\/$/, '');
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}

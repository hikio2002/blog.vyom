import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PenTool } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import TabletCard from '@/components/tablets/TabletCard';
import AdBanner from '@/components/common/AdBanner';
import { getActiveTabletCategories, getFeaturedTablets, getSiteSettings } from '@/lib/server-api';
import { getTabletCategoryIcon } from '@/lib/tablet-icons';
import type { Tablet as TabletType } from '@/types';

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Drawing Tablet Finder | ${settings.siteName}`,
    description: 'Browse drawing tablets by category — with full specs, pricing, and pros & cons.',
  };
}

export default async function TabletsPage() {
  const [categories, featured] = await Promise.all([
    getActiveTabletCategories(),
    getFeaturedTablets(8),
  ]);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3" style={{ fontFamily: 'var(--font-syne)' }}>
            <PenTool className="text-indigo-500" size={32} />
            Drawing Tablet Finder
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Find the right drawing tablet by category — with full specs, pricing, and pros &amp; cons.
          </p>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            {(categories as any[]).map(cat => {
              const Icon = getTabletCategoryIcon(cat.icon);
              return (
                <Link
                  key={String(cat._id)}
                  href={`/tablets/category/${cat.slug}`}
                  className="group flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Icon size={18} className="text-indigo-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </span>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>
        )}

        <Suspense fallback={null}>
          <AdBanner placement="homepage-banner" className="mb-10" />
        </Suspense>

        {/* Featured phones */}
        {featured.length > 0 ? (
          <section>
            <h2 className="section-title mb-5">Featured Drawing Tablets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {(featured as any[]).map(p => <TabletCard key={String(p._id)} tablet={p as TabletType} />)}
            </div>
          </section>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <PenTool size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">Drawing tablet categories coming soon!</p>
          </div>
        ) : null}
      </div>
    </PublicLayout>
  );
}

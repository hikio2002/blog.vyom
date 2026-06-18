import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import LaptopCard from '@/components/laptops/LaptopCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import AdBanner from '@/components/common/AdBanner';
import { getLaptopCategoryBySlug, getLaptopsByCategory, getAllLaptopCategorySlugs, getSiteSettings } from '@/lib/server-api';
import { getLaptopCategoryIcon } from '@/lib/laptop-icons';
import type { Laptop } from '@/types';

export const revalidate = 60;
type Props = { params: { slug: string }; searchParams: { page?: string } };

export async function generateStaticParams() {
  return getAllLaptopCategorySlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getLaptopCategoryBySlug(params.slug) as any;
  if (!cat) return { title: 'Not Found' };
  const settings = await getSiteSettings();
  return {
    title: `${cat.name} Laptops | ${settings.siteName}`,
    description: cat.description || `Browse ${cat.name} laptops with full specs and prices.`,
  };
}

export default async function LaptopCategoryPage({ params, searchParams }: Props) {
  const cat = await getLaptopCategoryBySlug(params.slug) as any;
  if (!cat) notFound();

  const page = Number(searchParams.page || 1);
  const { laptops, total, totalPages } = await getLaptopsByCategory(String(cat._id), { page, limit: 12 });
  const Icon = getLaptopCategoryIcon(cat.icon);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Laptop Finder', href: '/laptops' }, { label: cat.name }]} />

        <div className="mt-4 mb-8">
          <span className="badge-blue text-sm mb-2 inline-block">{total} laptop{total === 1 ? '' : 's'}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3" style={{ fontFamily: 'var(--font-syne)' }}>
            <Icon className="text-indigo-500" size={28} />
            {cat.name} Laptops
          </h1>
          {cat.description && <p className="text-gray-500 dark:text-gray-400 mt-2">{cat.description}</p>}
        </div>

        <Suspense fallback={null}>
          <AdBanner placement="header" className="mb-8" />
        </Suspense>

        {laptops.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No laptops in this category yet.</p>
            <Link href="/laptops" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">← Back to Laptop Finder</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {(laptops as any[]).map(p => <LaptopCard key={String(p._id)} laptop={p as Laptop} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a key={p} href={`?page=${p}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

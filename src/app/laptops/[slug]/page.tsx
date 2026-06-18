import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Star, ExternalLink } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import LaptopGallery from '@/components/laptops/LaptopGallery';
import LaptopCard from '@/components/laptops/LaptopCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import AdBanner from '@/components/common/AdBanner';
import { getLaptopBySlug, getRelatedLaptops, getAllLaptopSlugs, getSiteSettings } from '@/lib/server-api';
import type { Laptop } from '@/types';

export const revalidate = 120;
type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return getAllLaptopSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const laptop = await getLaptopBySlug(params.slug) as any;
  if (!laptop) return { title: 'Not Found' };
  const settings = await getSiteSettings();
  const title = `${laptop.brand} ${laptop.name} — Price, Specs & Review | ${settings.siteName}`;
  const description = laptop.description
    ? laptop.description.replace(/<[^>]*>/g, '').slice(0, 160)
    : `${laptop.brand} ${laptop.name} price, full specifications, and review.`;

  return {
    title,
    description,
    openGraph: {
      title, description,
      images: laptop.images?.[0] ? [{ url: laptop.images[0] }] : [],
      type: 'website',
    },
  };
}

const SPEC_LABELS: Record<string, string> = {
  display: 'Display',
  processor: 'Processor',
  graphics: 'Graphics',
  ram: 'RAM',
  storage: 'Storage',
  battery: 'Battery',
  ports: 'Ports',
  os: 'Operating System',
  weight: 'Weight',
  dimensions: 'Dimensions',
  colors: 'Colors',
};

export default async function LaptopDetailPage({ params }: Props) {
  const laptop = await getLaptopBySlug(params.slug) as any;
  if (!laptop) notFound();

  const specEntries = Object.entries(laptop.specs || {}).filter(([, v]) => v);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${laptop.brand} ${laptop.name}`,
    image: laptop.images,
    description: laptop.description?.replace(/<[^>]*>/g, '').slice(0, 300),
    brand: { '@type': 'Brand', name: laptop.brand },
    offers: {
      '@type': 'Offer',
      price: laptop.price,
      priceCurrency: laptop.currency === '₹' ? 'INR' : 'USD',
      availability: 'https://schema.org/InStock',
    },
    ...(laptop.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: laptop.rating, bestRating: 5, ratingCount: 1 } } : {}),
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Laptop Finder', href: '/laptops' },
          ...(laptop.category ? [{ label: laptop.category.name, href: `/laptops/category/${laptop.category.slug}` }] : []),
          { label: `${laptop.brand} ${laptop.name}` },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
          {/* Gallery */}
          <div>
            <LaptopGallery images={laptop.images || []} name={`${laptop.brand} ${laptop.name}`} />
          </div>

          {/* Info */}
          <div>
            {laptop.category && (
              <Link href={`/laptops/category/${laptop.category.slug}`} className="badge-blue mb-3 inline-block">
                {laptop.category.name}
              </Link>
            )}
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{laptop.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-1" style={{ fontFamily: 'var(--font-syne)' }}>
              {laptop.name}
            </h1>

            <div className="flex items-center gap-4 mt-4">
              <span className="text-3xl font-black text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
                {laptop.currency}{laptop.price.toLocaleString()}
              </span>
              {laptop.rating != null && (
                <span className="flex items-center gap-1.5 text-base font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <Star size={15} className="text-yellow-400 fill-yellow-400" />
                  {laptop.rating} / 5
                </span>
              )}
            </div>

            {laptop.buyLink && (
              <a href={laptop.buyLink} target="_blank" rel="noopener noreferrer sponsored"
                className="btn-primary mt-5 gap-2 inline-flex">
                Check Price <ExternalLink size={14} />
              </a>
            )}

            {/* Quick specs preview */}
            {specEntries.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {specEntries.slice(0, 4).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{SPEC_LABELS[key] || key}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{value as string}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pros & Cons */}
            {(laptop.pros?.length > 0 || laptop.cons?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {laptop.pros?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">Pros</h3>
                    <ul className="space-y-1.5">
                      {laptop.pros.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {laptop.cons?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-red-500 mb-2">Cons</h3>
                    <ul className="space-y-1.5">
                      {laptop.cons.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Suspense fallback={null}>
          <AdBanner placement="in-article" className="my-10" />
        </Suspense>

        {/* Description */}
        {laptop.description && (
          <section className="mt-10 max-w-3xl">
            <h2 className="section-title mb-4">Overview</h2>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: laptop.description }} />
          </section>
        )}

        {/* Full specs table */}
        {specEntries.length > 0 && (
          <section className="mt-10">
            <h2 className="section-title mb-4">Full Specifications</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {specEntries.map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-1/3">{SPEC_LABELS[key] || key}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{value as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Related phones */}
        {laptop.category && (
          <Suspense fallback={null}>
            <RelatedLaptops laptopId={String(laptop._id)} categoryId={String(laptop.category._id || laptop.category)} />
          </Suspense>
        )}
      </div>
    </PublicLayout>
  );
}

async function RelatedLaptops({ laptopId, categoryId }: { laptopId: string; categoryId: string }) {
  const related = await getRelatedLaptops(laptopId, categoryId);
  if (!related || related.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="section-title mb-5">Similar Laptops</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {(related as any[]).map(p => <LaptopCard key={String(p._id)} laptop={p as Laptop} />)}
      </div>
    </section>
  );
}

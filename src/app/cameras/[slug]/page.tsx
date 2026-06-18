import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Star, ExternalLink } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import CameraGallery from '@/components/cameras/CameraGallery';
import CameraCard from '@/components/cameras/CameraCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import AdBanner from '@/components/common/AdBanner';
import { getCameraBySlug, getRelatedCameras, getAllCameraSlugs, getSiteSettings } from '@/lib/server-api';
import type { Camera } from '@/types';

export const revalidate = 120;
type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return getAllCameraSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const camera = await getCameraBySlug(params.slug) as any;
  if (!camera) return { title: 'Not Found' };
  const settings = await getSiteSettings();
  const title = `${camera.brand} ${camera.name} — Price, Specs & Review | ${settings.siteName}`;
  const description = camera.description
    ? camera.description.replace(/<[^>]*>/g, '').slice(0, 160)
    : `${camera.brand} ${camera.name} price, full specifications, and review.`;

  return {
    title,
    description,
    openGraph: {
      title, description,
      images: camera.images?.[0] ? [{ url: camera.images[0] }] : [],
      type: 'website',
    },
  };
}

const SPEC_LABELS: Record<string, string> = {
  sensorType: 'Sensor Type',
  resolution: 'Resolution',
  lensMount: 'Lens Mount',
  iso: 'ISO Range',
  videoResolution: 'Video Resolution',
  autofocus: 'Autofocus',
  stabilization: 'Stabilization',
  battery: 'Battery Life',
  weight: 'Weight',
  dimensions: 'Dimensions',
};

export default async function CameraDetailPage({ params }: Props) {
  const camera = await getCameraBySlug(params.slug) as any;
  if (!camera) notFound();

  const specEntries = Object.entries(camera.specs || {}).filter(([, v]) => v);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${camera.brand} ${camera.name}`,
    image: camera.images,
    description: camera.description?.replace(/<[^>]*>/g, '').slice(0, 300),
    brand: { '@type': 'Brand', name: camera.brand },
    offers: {
      '@type': 'Offer',
      price: camera.price,
      priceCurrency: camera.currency === '₹' ? 'INR' : 'USD',
      availability: 'https://schema.org/InStock',
    },
    ...(camera.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: camera.rating, bestRating: 5, ratingCount: 1 } } : {}),
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Camera Finder', href: '/cameras' },
          ...(camera.category ? [{ label: camera.category.name, href: `/cameras/category/${camera.category.slug}` }] : []),
          { label: `${camera.brand} ${camera.name}` },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
          {/* Gallery */}
          <div>
            <CameraGallery images={camera.images || []} name={`${camera.brand} ${camera.name}`} />
          </div>

          {/* Info */}
          <div>
            {camera.category && (
              <Link href={`/cameras/category/${camera.category.slug}`} className="badge-blue mb-3 inline-block">
                {camera.category.name}
              </Link>
            )}
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{camera.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-1" style={{ fontFamily: 'var(--font-syne)' }}>
              {camera.name}
            </h1>

            <div className="flex items-center gap-4 mt-4">
              <span className="text-3xl font-black text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
                {camera.currency}{camera.price.toLocaleString()}
              </span>
              {camera.rating != null && (
                <span className="flex items-center gap-1.5 text-base font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <Star size={15} className="text-yellow-400 fill-yellow-400" />
                  {camera.rating} / 5
                </span>
              )}
            </div>

            {camera.buyLink && (
              <a href={camera.buyLink} target="_blank" rel="noopener noreferrer sponsored"
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
            {(camera.pros?.length > 0 || camera.cons?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {camera.pros?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">Pros</h3>
                    <ul className="space-y-1.5">
                      {camera.pros.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {camera.cons?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-red-500 mb-2">Cons</h3>
                    <ul className="space-y-1.5">
                      {camera.cons.map((c: string, i: number) => (
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
        {camera.description && (
          <section className="mt-10 max-w-3xl">
            <h2 className="section-title mb-4">Overview</h2>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: camera.description }} />
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
        {camera.category && (
          <Suspense fallback={null}>
            <RelatedCameras cameraId={String(camera._id)} categoryId={String(camera.category._id || camera.category)} />
          </Suspense>
        )}
      </div>
    </PublicLayout>
  );
}

async function RelatedCameras({ cameraId, categoryId }: { cameraId: string; categoryId: string }) {
  const related = await getRelatedCameras(cameraId, categoryId);
  if (!related || related.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="section-title mb-5">Similar Cameras</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {(related as any[]).map(p => <CameraCard key={String(p._id)} camera={p as Camera} />)}
      </div>
    </section>
  );
}

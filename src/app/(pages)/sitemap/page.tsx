import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import type { Category, Article } from '@/types';
export const metadata: Metadata = { title: 'Sitemap' };
const BASE = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api` : 'http://localhost:3000/api';

async function getData() {
  try {
    const [catRes, artRes] = await Promise.all([
      fetch(`${BASE}/categories?active=true`, { next: { revalidate: 600 } }),
      fetch(`${BASE}/articles?limit=100&sort=-publishedAt`, { next: { revalidate: 300 } }),
    ]);
    return {
      categories: catRes.ok ? await catRes.json() : [],
      articles: artRes.ok ? (await artRes.json()).articles || [] : [],
    };
  } catch { return { categories: [], articles: [] }; }
}

const pages = [
  { href: '/', label: 'Home' }, { href: '/about', label: 'About Us' }, { href: '/contact', label: 'Contact' },
  { href: '/authors', label: 'Authors' }, { href: '/categories', label: 'Categories' }, { href: '/search', label: 'Search' },
  { href: '/advertise', label: 'Advertise' }, { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' }, { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/editorial-policy', label: 'Editorial Policy' }, { href: '/cookie-policy', label: 'Cookie Policy' },
];

export default async function SitemapPage() {
  const { categories, articles } = await getData();
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Sitemap</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">All pages on Vyom.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800" style={{ fontFamily: 'var(--font-syne)' }}>Pages</h2>
            <ul className="space-y-2">{pages.map(p => <li key={p.href}><Link href={p.href} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">{p.label}</Link></li>)}</ul>
          </section>
          <section>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800" style={{ fontFamily: 'var(--font-syne)' }}>Categories</h2>
            <ul className="space-y-2">{(categories as Category[]).map(c => <li key={c._id}><Link href={`/category/${c.slug}`} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">{c.name}</Link></li>)}</ul>
          </section>
          <section>
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800" style={{ fontFamily: 'var(--font-syne)' }}>Recent Articles</h2>
            <ul className="space-y-2">{(articles as Article[]).slice(0, 30).map(a => <li key={a._id}><Link href={`/blog/${a.slug}`} className="text-sm text-brand-600 dark:text-brand-400 hover:underline line-clamp-1">{a.title}</Link></li>)}</ul>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import ArticleCard from '@/components/blog/ArticleCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import type { Article } from '@/types';

type Props = { params: { slug: string }; searchParams: { page?: string } };

const BASE = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api` : 'http://localhost:3000/api';

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${BASE}/categories/${slug}`, { next: { revalidate: 600 } });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function getArticles(categoryId: string, page = 1) {
  try {
    const res = await fetch(`${BASE}/articles?category=${categoryId}&page=${page}&limit=12`, { next: { revalidate: 60 } });
    return res.ok ? res.json() : { articles: [], total: 0, totalPages: 1 };
  } catch { return { articles: [], total: 0, totalPages: 1 }; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategory(params.slug);
  if (!cat) return { title: 'Not Found' };
  return { title: `${cat.name} – Vyom`, description: cat.description || `Browse all ${cat.name} articles on Vyom.` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const cat = await getCategory(params.slug);
  if (!cat) notFound();

  const page = Number(searchParams.page || 1);
  const { articles, total, totalPages } = await getArticles(cat._id, page);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: cat.name }]} />
        <div className="mt-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="badge-blue text-sm">{total} articles</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>{cat.name}</h1>
          {cat.description && <p className="text-gray-500 dark:text-gray-400 mt-2">{cat.description}</p>}
        </div>

        {articles.length === 0
          ? <div className="text-center py-16 text-gray-400"><p>No articles in this category yet.</p></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a: Article) => <ArticleCard key={a._id} article={a} />)}
            </div>
        }

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a key={p} href={`?page=${p}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

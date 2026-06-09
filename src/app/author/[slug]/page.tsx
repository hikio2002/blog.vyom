import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Linkedin, Github, Globe } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import ArticleCard from '@/components/blog/ArticleCard';
import Breadcrumb from '@/components/blog/Breadcrumb';
import type { Article } from '@/types';

type Props = { params: { slug: string } };
const BASE = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api` : 'http://localhost:3000/api';

async function getAuthor(slug: string) {
  try { const r = await fetch(`${BASE}/authors/${slug}`, { next: { revalidate: 600 } }); return r.ok ? r.json() : null; }
  catch { return null; }
}
async function getAuthorArticles(authorId: string) {
  try { const r = await fetch(`${BASE}/articles?author=${authorId}&limit=50`, { next: { revalidate: 120 } }); return r.ok ? (await r.json()).articles || [] : []; }
  catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthor(params.slug);
  if (!author) return { title: 'Not Found' };
  return { title: `${author.name} – Author at Vyom`, description: author.bio || `Articles by ${author.name} on Vyom.` };
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAuthor(params.slug);
  if (!author) notFound();
  const articles = await getAuthorArticles(author._id);
  const socials = [
    { key: 'twitter', icon: Twitter, label: 'Twitter' },
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { key: 'github', icon: Github, label: 'GitHub' },
    { key: 'website', icon: Globe, label: 'Website' },
  ];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Authors', href: '/authors' }, { label: author.name }]} />
        <div className="card p-6 sm:p-8 mt-6 mb-10 flex flex-col sm:flex-row gap-6 items-start">
          {author.avatar
            ? <Image src={author.avatar} alt={author.name} width={96} height={96} className="rounded-full flex-shrink-0 ring-4 ring-brand-100 dark:ring-brand-900" />
            : <span className="w-24 h-24 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 font-bold text-3xl flex-shrink-0" style={{ fontFamily: 'var(--font-syne)' }}>{author.name[0]}</span>
          }
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>{author.name}</h1>
            {author.email && <p className="text-sm text-gray-400 mt-0.5">{author.email}</p>}
            {author.bio && <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{author.bio}</p>}
            <div className="flex gap-2 mt-4">
              {socials.map(({ key, icon: Icon, label }) => author.socialLinks?.[key] && (
                <a key={key} href={author.socialLinks[key]} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-3xl font-black text-brand-600 dark:text-brand-400" style={{ fontFamily: 'var(--font-syne)' }}>{articles.length}</p>
            <p className="text-sm text-gray-400">Articles</p>
          </div>
        </div>

        <h2 className="section-title mb-6">Articles by {author.name}</h2>
        {articles.length === 0
          ? <div className="text-center py-12 text-gray-400"><p>No articles published yet.</p></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map((a: Article) => <ArticleCard key={a._id} article={a} />)}</div>
        }
      </div>
    </PublicLayout>
  );
}

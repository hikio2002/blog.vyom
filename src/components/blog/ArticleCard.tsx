import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { formatDate, readingTimeLabel } from '@/lib/utils';
import type { Article } from '@/types';

interface Props { article: Article; variant?: 'default' | 'featured' | 'horizontal' | 'compact'; }

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const href = `/blog/${article.slug}`;

  if (variant === 'horizontal') return (
    <Link href={href} className="group flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {article.featuredImage && (
        <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image src={article.featuredImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">{article.category.name}</span>}
        <h3 className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" style={{ fontFamily: 'var(--font-syne)' }}>
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{readingTimeLabel(article.readingTime)}</p>
      </div>
    </Link>
  );

  if (variant === 'featured') return (
    <Link href={href} className="group block relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
      {article.featuredImage && (
        <Image src={article.featuredImage} alt={article.title} fill className="object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
        {article.category && (
          <span className="inline-block px-2.5 py-1 bg-brand-600 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-2">{article.category.name}</span>
        )}
        <h2 className="text-white text-lg lg:text-xl font-bold line-clamp-2 group-hover:text-brand-300 transition-colors" style={{ fontFamily: 'var(--font-syne)' }}>{article.title}</h2>
        {article.excerpt && <p className="text-gray-300 text-sm mt-1.5 line-clamp-2 hidden sm:block">{article.excerpt}</p>}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          {article.author && <span>{article.author.name}</span>}
          <span>·</span><span>{formatDate(article.publishedAt)}</span>
          <span>·</span><span className="flex items-center gap-1"><Clock size={10} />{readingTimeLabel(article.readingTime)}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <Link href={href} className="group card flex flex-col hover:shadow-lg hover:shadow-brand-100/30 dark:hover:shadow-brand-900/20 hover:-translate-y-0.5 transition-all duration-300">
      {article.featuredImage && (
        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image src={article.featuredImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          {article.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-brand-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg uppercase tracking-wide">{article.category.name}</span>
          )}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        {!article.featuredImage && article.category && (
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-2">{article.category.name}</span>
        )}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug flex-1" style={{ fontFamily: 'var(--font-syne)' }}>
          {article.title}
        </h3>
        {article.excerpt && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{article.excerpt}</p>}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            {article.author?.avatar
              ? <Image src={article.author.avatar} alt={article.author.name} width={18} height={18} className="rounded-full" />
              : <span className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 font-bold text-xs">{article.author?.name?.[0]}</span>
            }
            <span className="truncate max-w-24">{article.author?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Clock size={10} />{readingTimeLabel(article.readingTime)}</span>
            <span className="flex items-center gap-1"><Eye size={10} />{article.viewCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

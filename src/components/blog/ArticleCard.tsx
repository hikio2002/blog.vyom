import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { formatDate, readingTimeLabel } from '@/lib/utils';
import type { Article } from '@/types';

interface Props {
  article: Article;
  variant?: 'default' | 'featured' | 'horizontal' | 'compact';
  className?: string;
  priority?: boolean;
}

export default function ArticleCard({
  article, variant = 'default', className = '', priority = false,
}: Props) {
  const href = `/blog/${article.slug}`;

  // ── Horizontal (sidebar / trending list) ──────────────────────────────────
  if (variant === 'horizontal') return (
    <Link href={href} className="group flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {article.featuredImage && (
        // Explicit width+height prevents CLS — browser knows dimensions before image loads
        <div className="relative w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ aspectRatio: '4/3' }}>
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category && (
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
            {article.category.name}
          </span>
        )}
        <h3
          className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
          <Clock size={10} aria-hidden="true" />
          {readingTimeLabel(article.readingTime)}
        </p>
      </div>
    </Link>
  );

  // ── Featured (hero or side card) ──────────────────────────────────────────
  if (variant === 'featured') {
    const isHero = className.includes('aspect-');

    if (isHero) return (
      <Link
        href={href}
        className={`group block relative rounded-2xl overflow-hidden bg-gray-900 ${className}`}
        aria-label={article.title}
      >
        {article.featuredImage && (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover opacity-75 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority={priority}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
          {article.category && (
            <span className="inline-block px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3">
              {article.category.name}
            </span>
          )}
          <h2
            className="text-white text-xl lg:text-2xl font-bold line-clamp-2 group-hover:text-indigo-300 transition-colors leading-snug"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-gray-300 text-sm mt-2 line-clamp-2 hidden sm:block leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            {article.author && <span className="truncate max-w-[120px]">{article.author.name}</span>}
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:flex items-center gap-1">
              <Clock size={10} aria-hidden="true" />
              {readingTimeLabel(article.readingTime)}
            </span>
          </div>
        </div>
      </Link>
    );

    // Side card: fixed-height image top + clean text below — no overlay
    return (
      <Link
        href={href}
        className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all duration-300 h-full"
        aria-label={article.title}
      >
        {/* Explicit aspect-ratio prevents layout shift while image loads */}
        <div className="relative bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '140px' }}>
          {article.featuredImage
            ? (
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
              />
            )
            : <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40" aria-hidden="true" />
          }
          {article.category && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600/90 text-white text-[10px] font-bold rounded uppercase tracking-wide backdrop-blur-sm">
              {article.category.name}
            </span>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3
            className="font-bold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            {article.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-auto pt-2 text-[11px] text-gray-400">
            <span className="truncate">{article.author?.name}</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap flex-shrink-0">
              <Clock size={9} className="inline mr-0.5" aria-hidden="true" />
              {readingTimeLabel(article.readingTime)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── Default card (article grid) ───────────────────────────────────────────
  return (
    <Link
      href={href}
      className="group card flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      aria-label={article.title}
    >
      {article.featuredImage && (
        // aspect-video = explicit 16:9 ratio — no CLS on mobile
        <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-xl">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
          {article.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg uppercase tracking-wide">
              {article.category.name}
            </span>
          )}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        {!article.featuredImage && article.category && (
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
            {article.category.name}
          </span>
        )}
        <h3
          className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug flex-1"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            {article.author?.avatar
              ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={18}
                  height={18}
                  className="rounded-full"
                  loading="lazy"
                />
              )
              : (
                <span
                  className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-xs"
                  aria-label={`${article.author?.name ?? 'Author'} avatar`}
                  role="img"
                >
                  {article.author?.name?.[0]}
                </span>
              )
            }
            <span className="truncate max-w-24">{article.author?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock size={10} aria-hidden="true" />
              {readingTimeLabel(article.readingTime)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import type { Article, Category } from '@/types';
import { safeJson } from '@/lib/fetch-json';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    fetch('/api/categories?active=true')
      .then(r => safeJson<Category[]>(r))
      .then(d => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
  }, []);

  const doSearch = useCallback(async (query: string, cat: string, t: string) => {
    if (!query && !cat && !t) { setArticles([]); setTotal(0); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const p = new URLSearchParams({ limit: '24' });
      if (query) p.set('search', query);
      if (cat) p.set('category', cat);
      if (t) p.set('tag', t);
      const res = await fetch(`/api/articles?${p}`);
      const data = await safeJson<{ articles: Article[]; total: number }>(res);
      setArticles(data?.articles || []); setTotal(data?.total || 0);
    } catch { setArticles([]); }
    finally { setLoading(false); }
  }, []);

  // Run once on mount if URL has params
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const iq = searchParams.get('q') || '';
    const it = searchParams.get('tag') || '';
    const ic = searchParams.get('category') || '';
    if (iq || it || ic) {
      setQ(iq); setTag(it); setCategory(ic);
      doSearch(iq, ic, it);
    }
  }, [doSearch, searchParams]);

  // Live search — debounced, fires as the user types or changes the category.
  // Skips the very first render (handled by the mount effect above) so we
  // don't double-fetch on initial load.
  const liveSearchSkipFirst = useRef(true);
  useEffect(() => {
    if (liveSearchSkipFirst.current) {
      liveSearchSkipFirst.current = false;
      return;
    }
    const handle = setTimeout(() => {
      doSearch(q, category, tag);
      // Keep the URL in sync without a full navigation
      const p = new URLSearchParams();
      if (q) p.set('q', q);
      if (category) p.set('category', category);
      if (tag) p.set('tag', tag);
      const next = p.toString() ? `/search?${p}` : '/search';
      window.history.replaceState(null, '', next);
    }, 300); // 300ms debounce

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Instant search on submit (bypasses debounce)
    doSearch(q, category, tag);
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    if (tag) p.set('tag', tag);
    const next = p.toString() ? `/search?${p}` : '/search';
    window.history.replaceState(null, '', next);
  };

  const clearTag = () => {
    setTag('');
    doSearch(q, category, '');
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    const next = p.toString() ? `/search?${p}` : '/search';
    window.history.replaceState(null, '', next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6" style={{ fontFamily: 'var(--font-syne)' }}>Search Articles</h1>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Start typing to search…" className="input pl-10 pr-10" />
            {loading && (
              <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />
            )}
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input sm:w-48">
            <option value="">All categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button type="submit" className="btn-primary px-6">Search</button>
        </form>

        {tag && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Filtering by tag:</span>
            <span className="badge-blue flex items-center gap-1">
              #{tag}
              <button onClick={clearTag} className="ml-1 hover:text-red-500 transition-colors"><X size={12} /></button>
            </span>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <div key={i} className="card h-72 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
          </div>
        )}

        {!loading && searched && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{total} result{total !== 1 ? 's' : ''} found</p>
            {articles.length === 0
              ? <div className="text-center py-16">
                  <Search size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No articles found.</p>
                  <p className="text-gray-400 text-sm mt-1">Try different keywords or browse by category.</p>
                </div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map(a => <ArticleCard key={a._id} article={a} />)}
                </div>
            }
          </>
        )}

        {!searched && !loading && (
          <div className="text-center py-16 text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Results appear instantly as you type</p>
          </div>
        )}
    </div>
  );
}

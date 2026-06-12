'use client';
import { useState, useEffect, useCallback } from 'react';
import { Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { safeJson } from '@/lib/fetch-json';

interface TagCount {
  name: string;
  count: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = Cookies.get('vyom_token');
    setLoading(true);
    try {
      const res = await fetch('/api/tags?admin=true', { headers: { Authorization: `Bearer ${token}` } });
      const data = await safeJson<TagCount[]>(res);
      if (Array.isArray(data)) setTags(data);
    } catch {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = async (tag: TagCount) => {
    if (!confirm(`Remove tag "${tag.name}" from all ${tag.count} article(s)?`)) return;
    const token = Cookies.get('vyom_token');
    try {
      const res = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: tag.name }),
      });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || 'Failed');
      toast.success('Tag removed');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove tag');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Tags</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {loading ? 'Loading…' : `${tags.length} tag${tags.length === 1 ? '' : 's'} — derived from article content`}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Tag size={32} className="mx-auto mb-3 opacity-30" />
          <p>No tags yet. Add tags to your articles and they&apos;ll appear here automatically.</p>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag.name}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 group">
                <Tag size={11} className="text-indigo-500" />
                {tag.name}
                <span className="text-xs text-gray-400 font-mono">{tag.count}</span>
                <button onClick={() => del(tag)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors ml-0.5 opacity-0 group-hover:opacity-100">
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

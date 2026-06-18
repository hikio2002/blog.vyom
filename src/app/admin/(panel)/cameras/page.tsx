'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, ExternalLink, Camera as CameraIcon, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeJson } from '@/lib/fetch-json';
import type { Camera, CameraCategory } from '@/types';
import Cookies from 'js-cookie';

export default function AdminCamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [categories, setCategories] = useState<CameraCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const headers = useCallback(() => {
    const token = Cookies.get('vyom_token');
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ admin: 'true', page: String(page), limit: '15' });
      if (categoryFilter) p.set('category', categoryFilter);
      const res = await fetch(`/api/cameras?${p}`, { headers: headers() });
      const data = await safeJson<{ cameras: Camera[]; total: number; totalPages: number }>(res);
      if (res.ok && data) {
        setCameras(data.cameras || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      toast.error('Failed to load cameras');
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, headers]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch('/api/camera-categories', { headers: headers() })
      .then(r => safeJson<CameraCategory[]>(r))
      .then(d => { if (Array.isArray(d)) setCategories(d); })
      .catch(() => {});
  }, [headers]);

  const del = async (camera: Camera) => {
    if (!confirm(`Delete "${camera.brand} ${camera.name}"?`)) return;
    try {
      const res = await fetch(`/api/cameras/${camera._id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error('Failed');
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggle = async (camera: Camera) => {
    try {
      await fetch(`/api/cameras/${camera._id}`, {
        method: 'PUT',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !camera.isActive }),
      });
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Cameras</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
        </div>
        <Link href="/admin/cameras/new" className="btn-primary gap-2"><Plus size={16} />Add Camera</Link>
      </div>

      <div className="flex gap-3 mb-5">
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="input sm:w-56 text-sm">
          <option value="">All categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
        ) : cameras.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <CameraIcon size={32} className="mx-auto mb-3 opacity-30" />
            <p>No cameras yet. <Link href="/admin/cameras/new" className="text-indigo-600 dark:text-indigo-400 hover:underline">Add one →</Link></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Camera</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Rating</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cameras.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
                          {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" unoptimized />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                            {p.brand} {p.name}
                            {p.isFeatured && <Star size={11} className="text-yellow-400 fill-yellow-400" />}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400 text-xs">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 font-medium">{p.currency}{p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-400">{p.rating ? `${p.rating} / 5` : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(p)} className={`badge cursor-pointer hover:opacity-80 ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {p.isActive && (
                          <a href={`/cameras/${p.slug}`} target="_blank" rel="noopener noreferrer" title="View live"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link href={`/admin/cameras/${p._id}`} title="Edit" className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => del(p)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

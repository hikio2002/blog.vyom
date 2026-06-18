'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, ExternalLink, Megaphone, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { safeJson } from '@/lib/fetch-json';

interface Ad {
  _id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: 'header' | 'sidebar' | 'in-article' | 'footer' | 'homepage-banner';
  isActive: boolean;
  opensInNewTab: boolean;
  order: number;
}

const empty = {
  name: '', imageUrl: '', linkUrl: '',
  placement: 'sidebar' as Ad['placement'],
  isActive: true, opensInNewTab: true, order: '0',
};

const PLACEMENT_INFO: Record<string, { label: string; size: string; desc: string }> = {
  'homepage-banner': { label: 'Homepage Banner', size: '970 × 90 px (or 728 × 90)', desc: 'Top of homepage, full width' },
  header:           { label: 'Header Banner',    size: '728 × 90 px',              desc: 'Below site header, all pages' },
  sidebar:          { label: 'Sidebar',          size: '300 × 250 px',             desc: 'Right sidebar on articles & homepage' },
  'in-article':     { label: 'In-Article',       size: '728 × 90 px',              desc: 'Embedded inside article content' },
  footer:           { label: 'Footer Banner',    size: '728 × 90 px',              desc: 'Above site footer, all pages' },
};

export default function AdsPanel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'new' | Ad | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const headers = useCallback(() => {
    const token = Cookies.get('vyom_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ads?admin=true', { headers: headers() });
      const data = await safeJson<Ad[]>(res);
      if (Array.isArray(data)) setAds(data);
    } catch {
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ ...empty }); setModal('new'); };
  const openEdit = (ad: Ad) => {
    setForm({
      name: ad.name, imageUrl: ad.imageUrl, linkUrl: ad.linkUrl,
      placement: ad.placement, isActive: ad.isActive,
      opensInNewTab: ad.opensInNewTab, order: String(ad.order),
    });
    setModal(ad);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.imageUrl.trim() || !form.linkUrl.trim()) {
      toast.error('Name, image URL and link URL are required');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, order: Number(form.order) || 0 };
      const isEdit = modal !== 'new';
      const url = isEdit ? `/api/ads/${(modal as Ad)._id}` : '/api/ads';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || `Server error (${res.status})`);
      toast.success(isEdit ? 'Ad updated' : 'Ad created');
      setModal(null);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save ad');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (ad: Ad) => {
    try {
      const res = await fetch(`/api/ads/${ad._id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ isActive: !ad.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(ad.isActive ? 'Ad disabled' : 'Ad enabled');
      load();
    } catch {
      toast.error('Failed to update ad');
    }
  };

  const del = async (ad: Ad) => {
    if (!confirm(`Delete "${ad.name}"?`)) return;
    try {
      const res = await fetch(`/api/ads/${ad._id}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw new Error('Failed');
      toast.success('Ad deleted');
      load();
    } catch {
      toast.error('Failed to delete ad');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-400">
          Manage ad banners across your site — disabled ads are hidden completely
        </p>
        <button onClick={openNew} className="btn-primary gap-2 flex-shrink-0">
          <Plus size={16} />New Ad
        </button>
      </div>

      {/* Placement guide */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
          <Megaphone size={15} className="text-indigo-500" />
          Recommended Image Sizes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(PLACEMENT_INFO).map(([key, info]) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{info.label}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{info.size}</p>
              <p className="text-xs text-gray-400 mt-1">{info.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ads list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : ads.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Megaphone size={32} className="mx-auto mb-3 opacity-30" />
          <p>No ads yet. <button onClick={openNew} className="text-indigo-600 dark:text-indigo-400 hover:underline">Create one →</button></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map(ad => (
            <div key={ad._id} className={`card overflow-hidden transition-opacity ${!ad.isActive ? 'opacity-50' : ''}`}>
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {ad.imageUrl ? (
                  <Image
                    src={ad.imageUrl}
                    alt={ad.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Megaphone size={24} />
                  </div>
                )}
                <span className={`absolute top-2 left-2 badge ${ad.isActive ? 'badge-green' : 'badge-gray'}`}>
                  {ad.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{ad.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{PLACEMENT_INFO[ad.placement]?.label || ad.placement}</p>
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 flex items-center gap-1 truncate">
                  <ExternalLink size={10} className="flex-shrink-0" />
                  <span className="truncate">{ad.linkUrl}</span>
                </a>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => toggle(ad)} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {ad.isActive
                      ? <><ToggleRight size={16} className="text-green-500" />Enabled</>
                      : <><ToggleLeft size={16} className="text-gray-400" />Disabled</>
                    }
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(ad)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => del(ad)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-5" style={{ fontFamily: 'var(--font-syne)' }}>
              {modal === 'new' ? 'New Advertisement' : 'Edit Advertisement'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="e.g. Summer Sale Banner" />
              </div>

              <div>
                <label className="label">Placement</label>
                <select value={form.placement} onChange={e => set('placement', e.target.value)} className="input">
                  {Object.entries(PLACEMENT_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.label} — {info.size}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  Recommended: {PLACEMENT_INFO[form.placement]?.size}
                </p>
              </div>

              <div>
                <label className="label">Image URL *</label>
                <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} className="input text-xs" placeholder="https://example.com/banner.jpg" />
                {form.imageUrl && (
                  <div className="relative aspect-video mt-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div>
                <label className="label">Link URL *</label>
                <input value={form.linkUrl} onChange={e => set('linkUrl', e.target.value)} className="input text-xs" placeholder="https://example.com/offer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Display Order</label>
                  <input type="number" value={form.order} onChange={e => set('order', e.target.value)} className="input" />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.opensInNewTab} onChange={e => set('opensInNewTab', e.target.checked)} className="rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Open in new tab</span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active (show on site)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submit} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

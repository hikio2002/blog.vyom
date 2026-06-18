'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { makeSlug } from '@/lib/utils';
import { safeJson } from '@/lib/fetch-json';
import RichEditor from './RichEditor';
import type { Tablet, TabletCategory } from '@/types';
import Cookies from 'js-cookie';

interface Props { tablet?: Tablet; }

const SPEC_FIELDS: { key: keyof Tablet['specs']; label: string; placeholder: string }[] = [
  { key: 'activeArea',     label: 'Active Area',      placeholder: '10 x 6.25 inches' },
  { key: 'resolution',     label: 'Resolution',        placeholder: '5080 LPI' },
  { key: 'pressureLevels', label: 'Pressure Levels',   placeholder: '8192 levels' },
  { key: 'penType',        label: 'Pen Type',          placeholder: 'Battery-free stylus' },
  { key: 'connectivity',   label: 'Connectivity',      placeholder: 'USB-C / Bluetooth' },
  { key: 'compatibility',  label: 'Compatibility',     placeholder: 'Windows, macOS, Android' },
  { key: 'expressKeys',    label: 'Express Keys',      placeholder: '8 customizable buttons' },
  { key: 'battery',        label: 'Battery',           placeholder: 'N/A (wired) / 15 hours' },
  { key: 'weight',         label: 'Weight',            placeholder: '700g' },
  { key: 'dimensions',     label: 'Dimensions',        placeholder: '26 x 17 x 0.8 cm' },
];

export default function TabletEditorForm({ tablet }: Props) {
  const router = useRouter();
  const isEdit = !!tablet;

  const [name, setName] = useState(tablet?.name || '');
  const [slug, setSlug] = useState(tablet?.slug || '');
  const [brand, setBrand] = useState(tablet?.brand || '');
  const [category, setCategory] = useState((tablet?.category as any)?._id || '');
  const [price, setPrice] = useState(tablet?.price ? String(tablet.price) : '');
  const [currency, setCurrency] = useState(tablet?.currency || '₹');
  const [images, setImages] = useState<string[]>(tablet?.images?.length ? tablet.images : ['']);
  const [description, setDescription] = useState(tablet?.description || '');
  const [specs, setSpecs] = useState<Tablet['specs']>(tablet?.specs || {});
  const [pros, setPros] = useState<string[]>(tablet?.pros?.length ? tablet.pros : ['']);
  const [cons, setCons] = useState<string[]>(tablet?.cons?.length ? tablet.cons : ['']);
  const [rating, setRating] = useState(tablet?.rating ? String(tablet.rating) : '');
  const [buyLink, setBuyLink] = useState(tablet?.buyLink || '');
  const [isActive, setIsActive] = useState(tablet?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(tablet?.isFeatured ?? false);

  const [categories, setCategories] = useState<TabletCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(isEdit);

  useEffect(() => {
    const token = Cookies.get('vyom_token');
    fetch('/api/tablet-categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => safeJson<TabletCategory[]>(r))
      .then(d => { if (Array.isArray(d)) setCategories(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slugEdited && brand && name) setSlug(makeSlug(`${brand}-${name}`));
  }, [brand, name, slugEdited]);

  const setSpecField = (key: keyof Tablet['specs'], val: string) =>
    setSpecs(s => ({ ...s, [key]: val }));

  const listFieldOps = (
    list: string[], setList: (v: string[]) => void
  ) => ({
    update: (i: number, v: string) => setList(list.map((x, idx) => idx === i ? v : x)),
    add: () => setList([...list, '']),
    remove: (i: number) => setList(list.length > 1 ? list.filter((_, idx) => idx !== i) : ['']),
  });

  const imgOps = listFieldOps(images, setImages);
  const prosOps = listFieldOps(pros, setPros);
  const consOps = listFieldOps(cons, setCons);

  const save = async () => {
    if (!name.trim() || !brand.trim() || !category) {
      toast.error('Name, brand and category are required');
      return;
    }
    const token = Cookies.get('vyom_token');
    setSaving(true);
    try {
      const payload = {
        name, slug: slug || makeSlug(`${brand}-${name}`), brand, category,
        price: Number(price) || 0,
        currency,
        images: images.map(i => i.trim()).filter(Boolean),
        description,
        specs,
        pros: pros.map(p => p.trim()).filter(Boolean),
        cons: cons.map(c => c.trim()).filter(Boolean),
        rating: rating ? Number(rating) : undefined,
        buyLink: buyLink.trim() || undefined,
        isActive,
        isFeatured,
      };

      const url = isEdit ? `/api/tablets/${tablet!._id}` : '/api/tablets';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || `Server error (${res.status})`);

      toast.success(isEdit ? 'Tablet updated!' : 'Tablet added!');
      if (!isEdit) router.push(`/admin/tablets/${data._id}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
            {isEdit ? 'Edit Tablet' : 'Add New Tablet'}
          </h1>
          {tablet?.slug && <p className="text-xs text-gray-400 mt-0.5">/tablets/{tablet.slug}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tablet?.slug && (
            <a href={`/tablets/${tablet.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline gap-1.5 text-xs py-2">
              Preview
            </a>
          )}
          <button onClick={save} disabled={saving} className="btn-primary gap-1.5 text-xs py-2">
            <Save size={13} />{saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Brand *</label>
              <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Wacom, Huion, XP-Pen, Apple…" className="input" />
            </div>
            <div>
              <label className="label">Model Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Intuos Pro, Kamvas 13, Deco Mini" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label flex items-center justify-between">
                <span>Slug</span>
                <button type="button" onClick={() => { setSlug(makeSlug(`${brand}-${name}`)); setSlugEdited(false); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Auto-generate
                </button>
              </label>
              <input value={slug} onChange={e => { setSlug(e.target.value); setSlugEdited(true); }} className="input font-mono text-sm" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="w-20">
                <label className="label">Currency</label>
                <input value={currency} onChange={e => setCurrency(e.target.value)} className="input text-center" />
              </div>
              <div className="flex-1">
                <label className="label">Price *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="14999" className="input" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">Images</h3>
            <div className="space-y-2">
              {images.map((img, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={img} onChange={e => imgOps.update(i, e.target.value)} placeholder="https://example.com/tablet.jpg" className="input text-xs flex-1" />
                  {img && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                  <button type="button" onClick={() => imgOps.remove(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={imgOps.add} className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Plus size={12} />Add image
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <RichEditor value={description} onChange={setDescription} />
          </div>

          {/* Specs */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPEC_FIELDS.map(f => (
                <div key={f.key}>
                  <label className="label text-xs">{f.label}</label>
                  <input value={specs[f.key] || ''} onChange={e => setSpecField(f.key, e.target.value)} placeholder={f.placeholder} className="input text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold text-green-600 dark:text-green-400 text-sm mb-3">Pros</h3>
              <div className="space-y-2">
                {pros.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={p} onChange={e => prosOps.update(i, e.target.value)} placeholder="Great battery life" className="input text-sm flex-1" />
                    <button type="button" onClick={() => prosOps.remove(i)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={prosOps.add} className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"><Plus size={12} />Add</button>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-red-500 text-sm mb-3">Cons</h3>
              <div className="space-y-2">
                {cons.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={c} onChange={e => consOps.update(i, e.target.value)} placeholder="No charger in box" className="input text-sm flex-1" />
                    <button type="button" onClick={() => consOps.remove(i)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={consOps.add} className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"><Plus size={12} />Add</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Publish</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active (show on site)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
            </label>
            <div>
              <label className="label">Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.1" value={rating} onChange={e => setRating(e.target.value)} placeholder="4.5" className="input" />
            </div>
            <div>
              <label className="label">Buy Link</label>
              <input value={buyLink} onChange={e => setBuyLink(e.target.value)} placeholder="https://amazon.in/…" className="input text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

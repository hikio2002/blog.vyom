'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Eye, CheckCircle, Clock, Plus, TrendingUp, MessageSquare, Users, FolderOpen, Settings, Calendar } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import { safeJson } from '@/lib/fetch-json';
import MonthlyViewsChart from '@/components/admin/MonthlyViewsChart';
import type { Article } from '@/types';
import Cookies from 'js-cookie';

interface MonthlyView { month: string; label: string; views: number; }

interface DashboardData {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  totalViews: number;
  currentMonthViews: number;
  monthlyViews: MonthlyView[];
  unreadMessages: number;
  recent: Article[];
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon size={20} /></div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = Cookies.get('vyom_token');
    try {
      const res = await fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      const result = await safeJson<DashboardData>(res);
      if (!res.ok) throw new Error((result as any)?.error || 'Failed to load dashboard');
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const recent = data?.recent || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back to Vyom Admin</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary gap-2"><Plus size={16} />New Article</Link>
      </div>

      {error && (
        <div className="card p-4 mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Array(5).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={FileText}    label="Total Articles" value={data?.total || 0}     color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
          <StatCard icon={CheckCircle} label="Published"      value={data?.published || 0} color="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
          <StatCard icon={Clock}       label="Drafts"         value={data?.drafts || 0}    color="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" />
          <StatCard icon={Eye}         label="Total Views"    value={data?.totalViews || 0} color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
          <StatCard icon={Calendar}    label="Views This Month" value={data?.currentMonthViews || 0} color="bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" />
        </div>
      )}

      {/* Monthly views chart */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
          <TrendingUp size={16} className="text-indigo-500" />Monthly Views (last 12 months)
        </h2>
        <p className="text-xs text-gray-400 mb-4">Resets at the start of each month — past months remain unchanged.</p>
        {loading ? (
          <div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ) : (
          <MonthlyViewsChart data={data?.monthlyViews || []} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2" style={{ fontFamily: 'var(--font-syne)' }}>
              <TrendingUp size={16} className="text-indigo-500" />Recent Articles
            </h2>
            <Link href="/admin/articles" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p>No articles yet. <Link href="/admin/articles/new" className="text-indigo-600 dark:text-indigo-400 hover:underline">Create your first →</Link></p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map(a => (
                <div key={a._id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/articles/${a._id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm line-clamp-1 transition-colors">{a.title}</Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      {a.category && <span>{a.category.name}</span>}
                      <span>·</span><span>{formatRelative(a.createdAt)}</span>
                      <span>·</span><span className="flex items-center gap-1"><Eye size={10} />{a.viewCount}</span>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${a.status === 'published' ? 'badge-green' : a.status === 'scheduled' ? 'badge-yellow' : 'badge-gray'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4" style={{ fontFamily: 'var(--font-syne)' }}>Quick Actions</h2>
          <div className="space-y-1">
            {[
              { href: '/admin/articles/new', Icon: Plus,        label: 'New Article',        cls: 'text-indigo-600 dark:text-indigo-400' },
              { href: '/admin/categories',   Icon: FolderOpen,  label: 'Categories',         cls: 'text-purple-600 dark:text-purple-400' },
              { href: '/admin/authors',      Icon: Users,       label: 'Authors',            cls: 'text-green-600 dark:text-green-400' },
              {
                href: '/admin/messages',
                Icon: MessageSquare,
                label: data && data.unreadMessages > 0 ? `Messages (${data.unreadMessages} new)` : 'Messages',
                cls: 'text-orange-600 dark:text-orange-400',
              },
              { href: '/admin/settings',     Icon: Settings,    label: 'Site Settings',      cls: 'text-gray-500 dark:text-gray-400' },
            ].map(({ href, Icon, label, cls }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon size={15} className={cls} />{label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { safeJson } from '@/lib/fetch-json';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || 'Subscription failed');
      toast.success(data?.message || 'Subscribed!');
      setEmail('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={subscribe} className="flex gap-2 w-full md:w-auto">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 md:w-72 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}

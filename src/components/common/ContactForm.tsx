'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { safeJson } from '@/lib/fetch-json';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (e: any) { toast.error(e.message || 'Failed to send message'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="label">Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} required className="input" placeholder="Your name" /></div>
        <div><label className="label">Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className="input" placeholder="your@email.com" /></div>
      </div>
      <div><label className="label">Subject</label><input value={form.subject} onChange={e => set('subject', e.target.value)} className="input" placeholder="What's this about?" /></div>
      <div><label className="label">Message *</label><textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={5} className="input resize-none" placeholder="Your message…" /></div>
      <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Sending…' : 'Send Message'}</button>
    </form>
  );
}

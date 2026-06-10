'use client';
import { useState, useEffect, useMemo } from 'react';
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatRelative } from '@/lib/utils';
import type { ContactMessage } from '@/types';
import Cookies from 'js-cookie';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const token = Cookies.get('vyom_token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  const load = () => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/contact${params}`, { headers })
      .then(r => r.json())
      .then(d => { setMessages(d.messages || []); setTotal(d.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [statusFilter, headers]);

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/contact/${id}`, { method: 'PATCH', headers: headers, body: JSON.stringify({ status: 'read' }) });
      load();
    } catch { toast.error('Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await fetch(`/api/contact/${id}`, { method: 'DELETE', headers: headers });
      toast.success('Deleted'); load();
    } catch { toast.error('Failed'); }
  };

  const toggle = (id: string) => {
    setExpanded(prev => prev === id ? null : id);
    const msg = messages.find(m => m._id === id);
    if (msg?.status === 'unread') markRead(id);
  };

  const unread = messages.filter(m => m.status === 'unread').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
            Messages {unread > 0 && <span className="ml-2 badge badge-blue">{unread} new</span>}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total messages</p>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40 text-sm">
          <option value="">All messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 card animate-pulse" />)}</div>
      ) : messages.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Mail size={32} className="mx-auto mb-3 opacity-30" />
          <p>No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => (
            <div key={msg._id} className={`card overflow-hidden transition-colors ${msg.status === 'unread' ? 'border-brand-200 dark:border-brand-800' : ''}`}>
              <button onClick={() => toggle(msg._id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className={`flex-shrink-0 p-1.5 rounded-lg ${msg.status === 'unread' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {msg.status === 'unread' ? <Mail size={14} /> : <MailOpen size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${msg.status === 'unread' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{msg.name}</span>
                    <span className="text-xs text-gray-400">{msg.email}</span>
                    {msg.subject && <span className="text-xs text-gray-500 dark:text-gray-400 truncate">· {msg.subject}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelative(msg.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge hidden sm:inline-flex ${msg.status === 'unread' ? 'badge-blue' : msg.status === 'replied' ? 'badge-green' : 'badge-gray'}`}>
                    {msg.status}
                  </span>
                  <button onClick={e => { e.stopPropagation(); del(msg._id); }} className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded">
                    <Trash2 size={13} />
                  </button>
                  {expanded === msg._id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </button>

              {expanded === msg._id && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Your message to Vyom'}`}
                      className="btn-primary text-xs py-1.5 gap-1.5">
                      <Mail size={12} />Reply via Email
                    </a>
                    {msg.status !== 'replied' && (
                      <button onClick={() => { fetch(`/api/contact/${msg._id}`, { method: 'PATCH', headers: headers, body: JSON.stringify({ status: 'replied' }) }).then(load); }}
                        className="btn-secondary text-xs py-1.5">Mark as Replied</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { MessageSquare, MessageCircle } from 'lucide-react';
import MessagesPanel from '@/components/admin/MessagesPanel';
import CommentsPanel from '@/components/admin/CommentsPanel';

/**
 * Unified Inbox — combines Messages (contact form submissions) and Comments
 * (blog post comments) into one section with a tab switcher, instead of two
 * separate nav items. Both panels keep their full original functionality.
 */
export default function AdminInboxPage() {
  const [tab, setTab] = useState<'messages' | 'comments'>('messages');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'var(--font-syne)' }}>
          Inbox
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Contact messages and blog comments in one place</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'messages'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <MessageSquare size={15} />Messages
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'comments'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <MessageCircle size={15} />Comments
        </button>
      </div>

      {tab === 'messages' ? <MessagesPanel /> : <CommentsPanel />}
    </div>
  );
}

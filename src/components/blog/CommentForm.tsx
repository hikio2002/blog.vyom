'use client';
import { useState, useId } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { safeJson } from '@/lib/fetch-json';

interface Props {
  articleId: string;
  parentId?: string;
  onSubmitted: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CommentForm({ articleId, parentId, onSubmitted, onCancel, autoFocus }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // useId generates stable IDs for label/input association — critical for
  // screen readers and the accessibility tree to be well-formed.
  const uid = useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      toast.error('Please fill in your name, email, and comment');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: articleId, parent: parentId, name, email, content }),
      });
      const data = await safeJson<any>(res);
      if (!res.ok) throw new Error(data?.error || `Failed to post comment (${res.status})`);

      toast.success(parentId ? 'Reply posted!' : 'Comment posted!');
      setContent('');
      if (parentId) { setName(''); setEmail(''); }
      onSubmitted();
    } catch (e: any) {
      toast.error(e.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${uid}-name`} className="sr-only">Your name</label>
          <input
            id={`${uid}-name`}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            required
            maxLength={80}
            className="input text-sm"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="sr-only">Your email address</label>
          <input
            id={`${uid}-email`}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email"
            aria-label="Your email address"
            required
            maxLength={120}
            className="input text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-content`} className="sr-only">
          {parentId ? 'Your reply' : 'Your comment'}
        </label>
        <textarea
          id={`${uid}-content`}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={parentId ? 'Write your reply…' : 'Write a comment…'}
          aria-label={parentId ? 'Your reply' : 'Your comment'}
          required
          maxLength={2000}
          rows={parentId ? 3 : 4}
          autoFocus={autoFocus}
          className="input resize-none text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting} className="btn-primary gap-1.5 text-sm py-2">
          <Send size={13} aria-hidden="true" />
          {submitting ? 'Posting…' : parentId ? 'Post Reply' : 'Post Comment'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary text-sm py-2">
            Cancel
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400">
        Your email will not be published.
      </p>
    </form>
  );
}

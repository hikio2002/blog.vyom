'use client';
import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Reply, User } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import { safeJson } from '@/lib/fetch-json';
import CommentForm from './CommentForm';
import type { Comment } from '@/types';

interface Props { articleId: string; }

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
      {initial || <User size={14} />}
    </span>
  );
}

function CommentItem({
  comment, articleId, depth, onReplyPosted,
}: {
  comment: Comment; articleId: string; depth: number; onReplyPosted: () => void;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className={depth > 0 ? 'pl-4 sm:pl-8 border-l-2 border-gray-100 dark:border-gray-800' : ''}>
      <div className="flex gap-3 py-4">
        <Avatar name={comment.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{comment.name}</span>
            <span className="text-xs text-gray-400">{formatRelative(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">{comment.content}</p>

          {depth === 0 && (
            <button
              onClick={() => setReplying(v => !v)}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
            >
              <Reply size={12} />{replying ? 'Cancel' : 'Reply'}
            </button>
          )}

          {replying && (
            <div className="mt-3">
              <CommentForm
                articleId={articleId}
                parentId={comment._id}
                autoFocus
                onCancel={() => setReplying(false)}
                onSubmitted={() => { setReplying(false); onReplyPosted(); }}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => (
                <CommentItem key={reply._id} comment={reply} articleId={articleId} depth={depth + 1} onReplyPosted={onReplyPosted} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?article=${articleId}`);
      const data = await safeJson<{ comments: Comment[]; total: number }>(res);
      if (res.ok && data) {
        setComments(data.comments || []);
        setTotal(data.total || 0);
      }
    } catch {
      // Silently fail — comments are non-critical
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="mt-10">
      <h2 className="section-title mb-5 flex items-center gap-2">
        <MessageCircle size={20} className="text-indigo-500" />
        Comments {total > 0 && <span className="text-gray-400 font-normal text-base">({total})</span>}
      </h2>

      <div className="card p-5 mb-6">
        <CommentForm articleId={articleId} onSubmitted={load} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800 px-5">
          {comments.map(c => (
            <CommentItem key={c._id} comment={c} articleId={articleId} depth={0} onReplyPosted={load} />
          ))}
        </div>
      )}
    </section>
  );
}

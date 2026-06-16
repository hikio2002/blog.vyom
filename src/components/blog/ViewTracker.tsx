'use client';
import { useEffect, useRef } from 'react';

interface Props { articleId: string; }

/**
 * Fires a view count POST exactly once when a real browser loads the page.
 * Since this is a Client Component:
 * - It never runs during SSR, ISR revalidation, or Googlebot crawls
 * - It never runs during Next.js prefetch (prefetch only fetches RSC data, not client JS)
 * - The server-side bot filter provides a second layer of protection
 */
export default function ViewTracker({ articleId }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Small delay so the page is fully visible before we ping the server
    const timer = setTimeout(() => {
      fetch(`/api/articles/${articleId}/view`, { method: 'POST' }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [articleId]);

  return null; // renders nothing
}

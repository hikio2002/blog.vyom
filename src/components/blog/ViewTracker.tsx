'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';

interface Props {
  articleId: string;
  /** Server-rendered count, shown immediately before the live count arrives
   *  (avoids a layout flash / blank space on first paint). */
  initialCount: number;
}

/**
 * Displays the view count and fires a view-increment POST once when a real
 * browser loads the page.
 *
 * Why this is a client component instead of just reading article.viewCount
 * in the server-rendered page: this blog page is statically generated with
 * generateStaticParams + ISR (revalidate=60), so article.viewCount is baked
 * into the HTML at build/revalidation time. The increment from THIS visit
 * wouldn't show up until the next revalidation — and even then, only to
 * the next visitor, not this one. Fetching the live count client-side
 * after incrementing means the number is always accurate the moment you
 * load the page, with no dependency on the ISR cache window.
 *
 * Since this is a Client Component:
 * - It never runs during SSR, ISR revalidation, or Googlebot crawls
 * - It never runs during Next.js prefetch (prefetch only fetches RSC data, not client JS)
 * - The server-side bot filter provides a second layer of protection
 */
export default function ViewTracker({ articleId, initialCount }: Props) {
  const fired = useRef(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Small delay so the page is fully visible before we ping the server
    const timer = setTimeout(() => {
      fetch(`/api/articles/${articleId}/view`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (typeof data?.viewCount === 'number') setCount(data.viewCount);
        })
        .catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [articleId]);

  return (
    <span className="inline-flex items-center gap-1">
      <Eye size={13} />{count.toLocaleString()} views
    </span>
  );
}

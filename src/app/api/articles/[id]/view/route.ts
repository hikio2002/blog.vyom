import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article, MonthlyStats } from '@/lib/models';

type Params = { params: { id: string } };

// Known bot/crawler User-Agent substrings to filter out.
// This list covers major search engines, SEO tools, and headless browsers.
const BOT_UA_PATTERNS = [
  'bot', 'crawler', 'spider', 'crawl', 'slurp', 'mediapartners',
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
  'applebot', 'semrush', 'ahrefs', 'moz', 'pingdom', 'uptimerobot',
  'headlesschrome', 'phantomjs', 'prerender', 'lighthouse',
  'python-requests', 'axios', 'curl', 'wget', 'java/', 'ruby/',
  'go-http-client', 'okhttp', 'cfnetwork', 'datadog',
];

function isBot(ua: string): boolean {
  if (!ua) return true; // No UA = bot or tool
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some(p => lower.includes(p));
}

/**
 * POST /api/articles/[id]/view
 *
 * Called client-side (once per page load) to record a human page view.
 * Filters out bots by User-Agent so view counts reflect real visitors,
 * not Googlebot crawls, ISR revalidations, prefetch requests, or tools.
 *
 * No auth required — public endpoint.
 * No body required — all data comes from URL params + headers.
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ua = req.headers.get('user-agent') || '';
    await dbConnect();

    if (isBot(ua)) {
      // Still return the current count so the UI can display something
      // sensible even when the visitor itself isn't counted as a view.
      const article = await Article.findById(params.id).select('viewCount').lean();
      return NextResponse.json({ counted: false, reason: 'bot', viewCount: (article as any)?.viewCount ?? 0 });
    }

    const month = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    const [updatedArticle] = await Promise.all([
      Article.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } }, { new: true }).select('viewCount'),
      MonthlyStats.findOneAndUpdate(
        { month },
        { $inc: { views: 1 } },
        { upsert: true }
      ),
    ]);

    return NextResponse.json({ counted: true, viewCount: updatedArticle?.viewCount ?? 0 });
  } catch (e: any) {
    // Non-critical — don't surface errors to the client
    console.error('POST /api/articles/[id]/view error:', e);
    return NextResponse.json({ counted: false }, { status: 500 });
  }
}

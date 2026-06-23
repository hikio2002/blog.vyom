import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article, MonthlyStats } from '@/lib/models';

type Params = { params: { id: string } };

// Bot detection: match only KNOWN bot/crawler signatures.
// CRITICAL: must NOT use substrings that appear in real browser UAs.
// Every real browser starts with "Mozilla/5.0" so patterns like 'moz',
// 'mozilla', 'webkit', 'safari', 'chrome' would block ALL real visitors.
// Use only specific bot-name strings that never appear in genuine browsers.
const BOT_PATTERNS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
  'slurp',                    // Yahoo crawler
  'facebookexternalhit',      // Facebook link preview
  'twitterbot',               // Twitter card
  'linkedinbot',              // LinkedIn preview
  'applebot',                 // Apple crawler (NOT 'apple' alone)
  'semrushbot', 'ahrefsbot', 'dotbot', 'mj12bot',  // SEO tools
  'pingbot', 'uptimerobot',   // uptime monitors
  'headlesschrome',           // headless Chrome detection
  'phantomjs', 'prerender',   // headless/prerender
  'python-requests',          // Python HTTP library
  'go-http-client',           // Go HTTP
  'java/1.',                  // Java HttpURLConnection (note: 'java/' alone would match "javascript")
  'okhttp/',                  // Android OkHttp (ends with /)
  'datadog-agent',            // Datadog monitoring
  'wget/', 'curl/',           // CLI tools (with trailing /)
  'scrapy',                   // Python scraper
  'ia_archiver',              // Wayback Machine
  'archive.org_bot',          // Archive.org
];

function isBot(ua: string): boolean {
  if (!ua || ua.length < 10) return true; // no UA or suspiciously short = tool
  const lower = ua.toLowerCase();
  return BOT_PATTERNS.some(p => lower.includes(p));
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const ua = req.headers.get('user-agent') || '';
    await dbConnect();

    if (isBot(ua)) {
      const article = await Article.findById(params.id).select('viewCount').lean();
      return NextResponse.json({
        counted: false,
        reason: 'bot',
        viewCount: (article as any)?.viewCount ?? 0,
      });
    }

    const month = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    const [updatedArticle] = await Promise.all([
      Article.findByIdAndUpdate(
        params.id,
        { $inc: { viewCount: 1 } },
        { new: true }
      ).select('viewCount'),
      MonthlyStats.findOneAndUpdate(
        { month },
        { $inc: { views: 1 } },
        { upsert: true }
      ),
    ]);

    return NextResponse.json({
      counted: true,
      viewCount: updatedArticle?.viewCount ?? 0,
    });
  } catch (e: any) {
    console.error('POST /api/articles/[id]/view error:', e);
    return NextResponse.json({ counted: false }, { status: 500 });
  }
}

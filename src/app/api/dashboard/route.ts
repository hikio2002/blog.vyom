import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article, Contact } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

/**
 * Single aggregation-based endpoint for the admin dashboard.
 * Replaces 4 separate /api/articles calls with one efficient query,
 * and computes site-wide total views correctly (not just from recent articles).
 */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const [statusCounts, viewsAgg, recent, unreadMessages] = await Promise.all([
      // Count articles grouped by status
      Article.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Sum viewCount across ALL articles (not just recent ones)
      Article.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
      ]),
      // Recent articles for the activity feed
      Article.find()
        .populate('category', 'name slug')
        .populate('author', 'name avatar slug')
        .sort({ createdAt: -1 })
        .limit(6)
        .select('-content -revisions')
        .lean(),
      // Unread message count
      Contact.countDocuments({ status: 'unread' }),
    ]);

    const counts: Record<string, number> = { draft: 0, published: 0, scheduled: 0 };
    let total = 0;
    for (const row of statusCounts) {
      if (row._id in counts) counts[row._id] = row.count;
      total += row.count;
    }

    const totalViews = viewsAgg[0]?.totalViews || 0;

    return NextResponse.json({
      total,
      published: counts.published,
      drafts: counts.draft,
      scheduled: counts.scheduled,
      totalViews,
      unreadMessages,
      recent,
    });
  } catch (e: any) {
    console.error('GET /api/dashboard error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

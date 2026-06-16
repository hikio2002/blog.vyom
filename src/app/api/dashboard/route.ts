import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article, Contact, MonthlyStats } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

/**
 * Single aggregation-based endpoint for the admin dashboard.
 */
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const [statusCounts, viewsAgg, recent, unreadMessages, monthlyDocs] = await Promise.all([
      // Count articles grouped by status
      Article.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Sum viewCount across ALL articles (lifetime total)
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
      // All monthly stats docs — we'll fill in missing months below
      MonthlyStats.find().lean(),
    ]);

    const counts: Record<string, number> = { draft: 0, published: 0, scheduled: 0 };
    let total = 0;
    for (const row of statusCounts) {
      if (row._id in counts) counts[row._id] = row.count;
      total += row.count;
    }

    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Build a map of 'YYYY-MM' -> views from stored docs
    const monthMap: Record<string, number> = {};
    for (const doc of monthlyDocs as any[]) {
      monthMap[doc.month] = doc.views;
    }

    // Generate the last 12 months (oldest -> newest), filling in 0 for any
    // month with no recorded views yet. This guarantees a full 12-point
    // graph even for brand-new sites.
    const now = new Date();
    const monthlyViews: { month: string; label: string; views: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyViews.push({ month: key, label, views: monthMap[key] || 0 });
    }

    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthViews = monthMap[currentMonthKey] || 0;

    return NextResponse.json({
      total,
      published: counts.published,
      drafts: counts.draft,
      scheduled: counts.scheduled,
      totalViews,
      currentMonthViews,
      monthlyViews,
      unreadMessages,
      recent,
    });
  } catch (e: any) {
    console.error('GET /api/dashboard error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

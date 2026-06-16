import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Comment, Article } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/comments?article=<articleId>
 * Returns approved top-level comments with their replies nested.
 *
 * GET /api/comments?admin=true
 * Returns ALL comments (any status) for the admin moderation panel,
 * flat (not nested), newest first.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('article');
    const admin = searchParams.get('admin') === 'true';

    if (admin) {
      const auth = requireAuth(req);
      if (auth instanceof NextResponse) return auth;

      const status = searchParams.get('status');
      const filter: any = {};
      if (status) filter.status = status;

      const comments = await Comment.find(filter)
        .populate('article', 'title slug')
        .sort({ createdAt: -1 })
        .lean();
      const total = await Comment.countDocuments(filter);
      return NextResponse.json({ comments, total });
    }

    if (!articleId) {
      return NextResponse.json({ error: 'article query param is required' }, { status: 400 });
    }

    const all = await Comment.find({ article: articleId, status: 'approved' })
      .sort({ createdAt: 1 })
      .lean();

    // Nest replies under their parent
    const byId: Record<string, any> = {};
    const topLevel: any[] = [];
    for (const c of all as any[]) {
      c.replies = [];
      byId[String(c._id)] = c;
    }
    for (const c of all as any[]) {
      if (c.parent) {
        const parent = byId[String(c.parent)];
        if (parent) parent.replies.push(c);
        else topLevel.push(c); // orphaned reply (parent deleted/unapproved) — show flat
      } else {
        topLevel.push(c);
      }
    }

    // Newest top-level comments first; replies stay in chronological order
    topLevel.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ comments: topLevel, total: all.length });
  } catch (e: any) {
    console.error('GET /api/comments error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/comments
 * Body: { article, name, email, content, parent? }
 * Anyone can post — no auth required. New comments are auto-approved
 * (status: 'approved') by default; set status to 'pending' below if you
 * want to moderate before publishing.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { article, name, email, content, parent } = body || {};

  if (!article || !name?.trim() || !email?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Article, name, email and comment are required' }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  if (content.trim().length > 2000) {
    return NextResponse.json({ error: 'Comment is too long (max 2000 characters)' }, { status: 400 });
  }

  try {
    await dbConnect();

    const articleExists = await Article.findById(article).select('_id').lean();
    if (!articleExists) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (parent) {
      const parentExists = await Comment.findOne({ _id: parent, article }).select('_id').lean();
      if (!parentExists) {
        return NextResponse.json({ error: 'The comment you are replying to no longer exists' }, { status: 404 });
      }
    }

    const comment = await Comment.create({
      article,
      parent: parent || null,
      name: name.trim().slice(0, 80),
      email: email.trim().toLowerCase().slice(0, 120),
      content: content.trim(),
      status: 'approved',
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/comments error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

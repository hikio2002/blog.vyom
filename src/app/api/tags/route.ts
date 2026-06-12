import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

/**
 * Tags are not a separate managed collection — they live as a `tags: string[]`
 * array on each Article. This endpoint aggregates distinct tag values across
 * all articles (or published-only for the public site) along with a usage count.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === 'true';

    const match: any = {};
    if (!adminMode) match.status = 'published';

    const result = await Article.aggregate([
      { $match: match },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]);

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('GET /api/tags error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * "Deleting" a tag removes it from every article that has it.
 * Body: { name: string }
 */
export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const name = body?.name;
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
  }

  try {
    await dbConnect();
    const result = await Article.updateMany(
      { tags: name },
      { $pull: { tags: name } }
    );
    return NextResponse.json({ message: 'Tag removed', modified: result.modifiedCount });
  } catch (e: any) {
    console.error('DELETE /api/tags error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

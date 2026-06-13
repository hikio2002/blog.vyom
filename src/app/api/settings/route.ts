import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Setting } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Setting.find().lean();
    const obj: Record<string, any> = {};
    settings.forEach((s: any) => { obj[s.key] = s.value; });
    return NextResponse.json(obj);
  } catch (e: any) {
    console.error('GET /api/settings error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  try {
    await dbConnect();

    const ops = Object.entries(body).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await Setting.bulkWrite(ops as any);
    }

    const updated = await Setting.find().lean();
    const obj: Record<string, any> = {};
    updated.forEach((s: any) => { obj[s.key] = s.value; });

    // Settings affect <title>, meta description, footer, AdSense/GA on every
    // page (via the root layout) — invalidate the full cache immediately so
    // changes show up on next page load instead of waiting for revalidate window.
    revalidatePath('/', 'layout');

    return NextResponse.json(obj);
  } catch (e: any) {
    console.error('PUT /api/settings error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal server error while saving settings' },
      { status: 500 }
    );
  }
}

// Some browsers/proxies send a CORS preflight OPTIONS request before PUT
// when custom headers (Authorization, Content-Type) are present.
// Without this handler, Next.js returns 405 for OPTIONS.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

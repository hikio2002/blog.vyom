import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Setting } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

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
  // Auth check first
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  // Parse body separately — req.json() can throw on empty/invalid bodies
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
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
    return NextResponse.json(obj);
  } catch (e: any) {
    console.error('PUT /api/settings error:', e);
    return NextResponse.json(
      { error: e?.message || 'Internal server error while saving settings' },
      { status: 500 }
    );
  }
}

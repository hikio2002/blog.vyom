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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    const ops = Object.entries(body).map(([key, value]) => ({
      updateOne: { filter: { key }, update: { $set: { value } }, upsert: true },
    }));
    if (ops.length) await Setting.bulkWrite(ops);
    const updated = await Setting.find().lean();
    const obj: Record<string, any> = {};
    updated.forEach((s: any) => { obj[s.key] = s.value; });
    return NextResponse.json(obj);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

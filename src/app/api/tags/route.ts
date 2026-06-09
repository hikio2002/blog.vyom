import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Tag } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug } from '@/lib/utils';

export async function GET() {
  try {
    await dbConnect();
    const tags = await Tag.find().sort({ name: 1 }).lean();
    return NextResponse.json(tags);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const { name } = await req.json();
    const slug = makeSlug(name);
    const tag = await Tag.findOneAndUpdate({ slug }, { name, slug }, { upsert: true, new: true });
    return NextResponse.json(tag, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

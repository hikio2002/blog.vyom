import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Category } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    const filter = activeOnly ? { isActive: true } : {};
    const cats = await Category.find(filter).sort({ order: 1, name: 1 }).lean();
    return NextResponse.json(cats);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    const slug = body.slug || makeSlug(body.name);
    const exists = await Category.findOne({ slug });
    if (exists) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    const cat = await Category.create({ ...body, slug });
    return NextResponse.json(cat, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

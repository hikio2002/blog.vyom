import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Ad } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement');
    const adminMode = searchParams.get('admin') === 'true';

    const filter: any = {};
    if (!adminMode) filter.isActive = true;
    if (placement) filter.placement = placement;

    const ads = await Ad.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(ads);
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
    if (!body.name || !body.imageUrl || !body.linkUrl) {
      return NextResponse.json({ error: 'Name, image URL and link URL are required' }, { status: 400 });
    }
    const ad = await Ad.create(body);
    return NextResponse.json(ad, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Camera } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Number(searchParams.get('limit') || 12));
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || '-createdAt';
    const admin = searchParams.get('admin') === 'true';

    const filter: any = {};
    if (!admin) filter.isActive = true;
    if (category) filter.category = category;
    if (featured) filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [cameras, total] = await Promise.all([
      Camera.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Camera.countDocuments(filter),
    ]);

    return NextResponse.json({ cameras, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    console.error('GET /api/cameras error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!body?.name || !body?.brand || !body?.category) {
    return NextResponse.json({ error: 'Name, brand and category are required' }, { status: 400 });
  }

  try {
    await dbConnect();
    const slug = body.slug || makeSlug(`${body.brand}-${body.name}`);
    const exists = await Camera.findOne({ slug });
    if (exists) return NextResponse.json({ error: 'A camera with this slug already exists' }, { status: 409 });

    const camera = await Camera.create({ ...body, slug });

    revalidatePath('/cameras');
    revalidatePath(`/cameras/${slug}`);

    return NextResponse.json(camera, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/cameras error:', e);
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

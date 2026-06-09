import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Category } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug } from '@/lib/utils';
import mongoose from 'mongoose';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    // Support lookup by slug OR _id
    const query = mongoose.isValidObjectId(params.id)
      ? { _id: params.id }
      : { slug: params.id };
    const cat = await Category.findOne(query).lean();
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(cat);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    if (body.name && !body.slug) body.slug = makeSlug(body.name);
    const cat = await Category.findByIdAndUpdate(params.id, body, { new: true });
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(cat);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    const cat = await Category.findByIdAndUpdate(params.id, body, { new: true });
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(cat);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    await Category.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

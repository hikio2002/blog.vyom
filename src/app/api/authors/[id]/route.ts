import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Author } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const query = mongoose.isValidObjectId(params.id) ? { _id: params.id } : { slug: params.id };
    const author = await Author.findOne(query).lean();
    if (!author) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(author);
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
    const author = await Author.findByIdAndUpdate(params.id, body, { new: true });
    if (!author) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(author);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    await Author.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

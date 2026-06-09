import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Author } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin') === 'true';
    const filter = admin ? {} : { isActive: true };
    const authors = await Author.find(filter).sort({ name: 1 }).lean();
    return NextResponse.json(authors);
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
    const exists = await Author.findOne({ slug });
    if (exists) return NextResponse.json({ error: 'Author slug already exists' }, { status: 409 });
    const author = await Author.create({ ...body, slug });
    return NextResponse.json(author, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

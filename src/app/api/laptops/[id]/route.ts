import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Laptop } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const laptop = await Laptop.findById(params.id).populate('category', 'name slug').lean();
    if (!laptop) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(laptop);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  try {
    await dbConnect();
    const existing = await Laptop.findById(params.id).lean();
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await Laptop.findByIdAndUpdate(params.id, { $set: body }, { new: true })
      .populate('category', 'name slug');

    if (updated) {
      revalidatePath('/laptops');
      revalidatePath(`/laptops/${(updated as any).slug}`);
      if ((existing as any).slug !== (updated as any).slug) {
        revalidatePath(`/laptops/${(existing as any).slug}`);
      }
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error('PUT /api/laptops/[id] error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const deleted = await Laptop.findByIdAndDelete(params.id).lean();

    if (deleted) {
      revalidatePath('/laptops');
      revalidatePath(`/laptops/${(deleted as any).slug}`);
    }

    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

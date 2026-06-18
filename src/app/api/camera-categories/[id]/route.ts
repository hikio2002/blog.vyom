import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { CameraCategory, Camera } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    const cat = await CameraCategory.findByIdAndUpdate(params.id, body, { new: true });
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(cat);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    const cat = await CameraCategory.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(cat);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();

    const laptopCount = await Camera.countDocuments({ category: params.id });
    if (laptopCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${laptopCount} camera(s) still use this category` },
        { status: 409 }
      );
    }

    await CameraCategory.findByIdAndDelete(params.id);
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
      'Access-Control-Allow-Methods': 'PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

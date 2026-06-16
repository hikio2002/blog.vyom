import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Comment } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (body?.status && !['pending', 'approved', 'spam'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    await dbConnect();
    const comment = await Comment.findByIdAndUpdate(params.id, { $set: body }, { new: true });
    if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(comment);
  } catch (e: any) {
    console.error('PATCH /api/comments/[id] error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    // Deleting a comment also deletes its replies to avoid orphaned threads.
    await Comment.deleteMany({ $or: [{ _id: params.id }, { parent: params.id }] });
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    console.error('DELETE /api/comments/[id] error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

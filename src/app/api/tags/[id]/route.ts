import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Tag } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    await Tag.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

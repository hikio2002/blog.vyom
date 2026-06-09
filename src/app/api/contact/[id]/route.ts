import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Contact } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();
    const msg = await Contact.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(msg);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    await Contact.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

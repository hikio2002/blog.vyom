import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Contact } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, subject, message } = body;
    if (!name || !email || !message) return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    const contact = await Contact.create({ name, email, subject, message });
    return NextResponse.json({ message: 'Message sent successfully', id: contact._id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);
    const filter = status ? { status } : {};
    const [messages, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Contact.countDocuments(filter),
    ]);
    return NextResponse.json({ messages, total });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

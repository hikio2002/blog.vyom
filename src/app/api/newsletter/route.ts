import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Subscriber } from '@/lib/models';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isActive) return NextResponse.json({ message: 'Already subscribed' });
      existing.isActive = true;
      await existing.save();
      return NextResponse.json({ message: 'Resubscribed successfully' });
    }
    await Subscriber.create({ email: email.toLowerCase() });
    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

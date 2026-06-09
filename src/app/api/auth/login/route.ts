import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).lean();
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const valid = await comparePassword(password, (user as any).password);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ userId: String((user as any)._id), email: (user as any).email, role: (user as any).role });

    const res = NextResponse.json({
      user: { id: (user as any)._id, email: (user as any).email, name: (user as any).name, role: (user as any).role },
      token,
    });
    res.cookies.set('vyom_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/', secure: process.env.NODE_ENV === 'production' });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

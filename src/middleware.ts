import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware runs on the Edge Runtime — cannot use Node.js APIs (bcryptjs, jsonwebtoken).
 * We do a lightweight JWT structure check here.
 * Full cryptographic verification happens in requireAuth() inside each API route (Node.js runtime).
 */
function hasValidTokenStructure(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // Decode payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    // Check it has required fields
    if (!payload.sub || !payload.email) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('vyom_token')?.value;
    if (!token || !hasValidTokenStructure(token)) {
      const res = NextResponse.redirect(new URL('/admin/login', req.url));
      res.cookies.delete('vyom_token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

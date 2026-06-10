import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-prod';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

function base64UrlDecode(value: string): Uint8Array {
  const replaced = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = replaced.padEnd(replaced.length + ((4 - (replaced.length % 4)) % 4), '=');
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

function utf8ToUint8Array(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const unsignedToken = `${headerB64}.${payloadB64}`;
    const signature = base64UrlDecode(signatureB64);

    const key = await crypto.subtle.importKey(
      'raw',
      utf8ToUint8Array(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      utf8ToUint8Array(unsignedToken),
    );

    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as JWTPayload;

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.cookies.get('vyom_token');
  if (cookie) return cookie.value;
  return null;
}

export async function requireAuth(req: NextRequest): Promise<{ payload: JWTPayload } | NextResponse> {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  return { payload };
}

export async function requireAdmin(req: NextRequest): Promise<{ payload: JWTPayload } | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return result;
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting store for proxy runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // ─── 1. Security Headers (Defense-in-Depth) ──────────────────────────────
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // ─── 2. Rate Limiting for API Endpoints ─────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const limit = 150; // Max requests per window

    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', (limit - 1).toString());
    } else {
      record.count += 1;
      const remaining = Math.max(0, limit - record.count);
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());

      if (record.count > limit) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Too many requests. Rate limit exceeded.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

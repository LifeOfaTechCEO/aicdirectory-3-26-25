import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { env } from './lib/env';
import type { AdminJwtPayload } from './types/auth';

export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify the token
      const decoded = verify(token, env.JWT_SECRET) as AdminJwtPayload;
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Add user info to headers for use in API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-admin-user', JSON.stringify(decoded));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 
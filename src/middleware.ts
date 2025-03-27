import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Allow public routes
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.startsWith('/items/') ||
    request.nextUrl.pathname.startsWith('/tools/') ||
    request.nextUrl.pathname.startsWith('/influencers/')
  ) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Handle API routes
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Invalid token' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value || null;

  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname.startsWith('/api/auth') || pathname === '/auth' || pathname === '/') {
    return NextResponse.next();
  }

  if (!token) {
    // Redirect to login if no token and trying to access protected page
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }
}

// Configure which routes to apply middleware on
export const config = {
  matcher: ['/tasks', '/dashboard', '/profile'], // your protected routes here
};

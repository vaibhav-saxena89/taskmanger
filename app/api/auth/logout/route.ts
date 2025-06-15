import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the cookie by setting it with empty value and immediate expiration
  const response = NextResponse.json({ message: 'Logged out successfully' });

  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), // Expire immediately
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

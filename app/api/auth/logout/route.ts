import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Clear the authentication cookie
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });
  return response;
}

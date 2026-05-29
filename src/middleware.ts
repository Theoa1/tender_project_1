import { NextRequest, NextResponse } from 'next/server';
import {
  verifyOwnerSession,
  verifyClientSession,
  SESSION_COOKIE,
  CLIENT_COOKIE_NAME,
} from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/setup') {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = await verifyOwnerSession(token);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/account') && pathname !== '/account/login') {
    const token = req.cookies.get(CLIENT_COOKIE_NAME)?.value;
    const session = await verifyClientSession(token);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/account/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};

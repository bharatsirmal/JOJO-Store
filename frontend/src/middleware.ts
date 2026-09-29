import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;
  const path = request.nextUrl.pathname;

  const isAdminPath = path.startsWith('/admin') && path !== '/admin-login';
  const isDeliveryPath = path.startsWith('/delivery') && path !== '/delivery-login' && path !== '/delivery-register';
  const isProtectedPath = path.startsWith('/account') || isAdminPath || isDeliveryPath;
  const isAuthPath = path === '/login' || path === '/register' || path === '/admin-login' || path === '/delivery-login' || path === '/delivery-register';

  const isHomePath = path === '/';

  if (!session && isProtectedPath) {
    if (isAdminPath) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    if (isDeliveryPath) {
      return NextResponse.redirect(new URL('/delivery-login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isAuthPath) {
    try {
      const payloadBase64 = session.split('.')[1];
      if (payloadBase64) {
        const payload = JSON.parse(atob(payloadBase64));
        const role = payload.role || 'customer';
        if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
        if (role === 'delivery_partner') return NextResponse.redirect(new URL('/delivery', request.url));
      }
    } catch(e) {}
    return NextResponse.redirect(new URL('/account', request.url));
  }

  if (session) {
    try {
      const payloadBase64 = session.split('.')[1];
      if (!payloadBase64) throw new Error("Invalid session cookie");
      
      const payload = JSON.parse(atob(payloadBase64));
      const role = payload.role || 'customer';

      // Lock delivery_partners strictly into the delivery portal
      if (role === 'delivery_partner' && !isDeliveryPath) {
        return NextResponse.redirect(new URL('/delivery', request.url));
      }

      // Lock admins strictly into the admin portal
      if (role === 'admin' && !isAdminPath) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Stop normal customers from accessing admin/delivery
      if (isAdminPath && role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (isDeliveryPath && role !== 'delivery_partner' && role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      console.error("Middleware token parsing error", error);
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('__session');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

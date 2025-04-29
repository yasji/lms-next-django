import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/auth');
  const isAdminRoute = pathname.startsWith('/dashboard/admin');
  const isReaderRoute = pathname.startsWith('/dashboard/reader');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isUnauthorizedRoute = pathname.startsWith('/unauthorized');
  const isPublicRoute = ['/auth/login', '/auth/register'].includes(pathname);
  const isStaticResource = pathname.startsWith('/_next') || 
                         pathname.startsWith('/favicon.ico') || 
                         pathname.startsWith('/fonts') || 
                         pathname.startsWith('/images');

  // Don't process static resources or API routes (they're handled by the backend)
  if (isStaticResource || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Don't redirect if already on the unauthorized page
  if (isUnauthorizedRoute) {
    return NextResponse.next();
  }

  // Get cookies
  const accessToken = request.cookies.get('access_token')?.value;
  
  // Clone the headers to forward cookies in our fetch request
  const headers = new Headers(request.headers);
  if (accessToken) {
    headers.set('Cookie', `access_token=${accessToken}`);
  }

  // For admin routes, verify admin access
  if (isAdminRoute && accessToken) {
    try {
      // Using the same-origin fetch to verify role directly
      const response = await fetch(`${API_URL}/auth/verify-role`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      
      // Check if authenticated and if user is admin
      if (!data.authenticated || !data.isAdmin) {
        console.log('Admin access denied:', data);
        // Redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // If admin, allow access
      console.log('Admin access granted:', data);
    } catch (error) {
      console.error('Error verifying admin role:', error);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // For reader routes, verify reader access
  if (isReaderRoute && accessToken) {
    try {
      // Using the same-origin fetch to verify role directly
      const response = await fetch(`${API_URL}/auth/verify-role`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      
      // Check if authenticated and if user is reader
      if (!data.authenticated) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
      
      // Admin users shouldn't access reader routes - redirect to admin dashboard
      if (data.isAdmin) {
        console.log('Admin trying to access reader dashboard, redirecting to admin dashboard');
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    } catch (error) {
      console.error('Error verifying reader role:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Handle unauthenticated users trying to access protected routes
  if (!accessToken && isDashboardRoute && !isPublicRoute) {
    console.log('Redirecting unauthenticated user to login');
    const returnUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/login?returnUrl=${returnUrl}`, request.url));
  }

  // Handle authenticated users
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard/reader', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static resources
    '/((?!_next|favicon.ico|fonts|images).*)',
  ],
};

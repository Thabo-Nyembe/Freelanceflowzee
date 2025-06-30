import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  '/',
  '/landing', '/login', '/signup', '/features', '/how-it-works', '/docs', '/tutorials',
  '/community', '/api-docs', '/demo', '/support', '/contact', '/payment', '/blog',
  '/newsletter', '/privacy', '/terms', '/pricing', '/careers', '/cookies',
  '/book-appointment', '/community-showcase', '/enhanced-collaboration-demo'
];

export function middleware(req: NextRequest) {
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // Add your authentication/session logic here if needed
  return NextResponse.next();
}
